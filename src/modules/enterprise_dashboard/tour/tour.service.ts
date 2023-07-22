import { Inject, Service } from "typedi";
import { Create, ETourStatusFilter, FindAll, FindOne, Update } from "./tour.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";
import { sequelize } from "database/models";
import FileService from "services/file";
import GetLanguage from "services/getLanguage";
import { tourLangFields } from "models/langField";

@Service()
export default class TourService {
  constructor(
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("tourSchedulesModel") private tourSchedulesModel: ModelsInstance.TourSchedules
  ) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;

      let whereOptions: WhereOptions = {
        parentLanguage: null,
        owner: enterpriseId,
      };

      if(data.status === ETourStatusFilter.ACTIVED) {
        whereOptions = {
          ...whereOptions,
          isDeleted: false,
        }
      }

      if(data.status === ETourStatusFilter.IN_ACTIVED) {
        whereOptions = {
          ...whereOptions,
          isDeleted: true,
        }
      }

      const offset = data.take * (data.page - 1);

      const listTours = await this.toursModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
          {
            attributes: ["id", "startDate", "childrenPrice", "adultPrice"],
            association: "tourOnSales",
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const result = listTours.rows.map((tour) => {
        let numberOfUpcomingTours = 0;
        let numberOfTookPlaceTours = 0;
        tour.tourOnSales.map((item) => {
          if (new Date(item.startDate) > new Date()) {
            numberOfUpcomingTours++;
          } else {
            numberOfTookPlaceTours++;
          }
        });
        let isCanDelete = false;
        const latestTourOnSale = tour.tourOnSales?.[tour.tourOnSales?.length - 1];
        if (!latestTourOnSale || new Date(latestTourOnSale?.startDate) < new Date()) {
          isCanDelete = true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tourOnSales, ...rest } = { ...tour.dataValues };
        return {
          // test: 0,
            ...rest,
            numberOfUpcomingTours,
            numberOfTookPlaceTours,
            isCanDelete,
        };
      });

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listTours.count,
          page: data.page,
          pageCount: Math.ceil(listTours.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(id: number, data: FindOne, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;

      const tourWhereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };
      let tour = await this.toursModel.findOne({
        where: tourWhereOptions,
        include: [
          {
            association: "languages",
          },
          {
            association: "tourOnSales",
          },
        ],
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }

      if (data.language) {
        tour = GetLanguage.getLang(tour.toJSON(), data.language, tourLangFields);
      }

      return res.onSuccess(tour);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async create(data: Create, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const imageUrls = await FileService.uploadAttachments2([...files]);
      if (!imageUrls?.length) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: "Image is required",
        });
      }
      // const imageUrls = images?.map((image) => image?.url);

      const newTour = await this.toursModel.create(
        {
          title: data?.title,
          numberOfDays: data?.numberOfDays,
          numberOfNights: data?.numberOfNights,
          images: imageUrls,
          contact: data?.contact,
          cityStart: data?.cityStart || "",
          districtStart: data?.districtStart || "",
          communeStart: data?.communeStart || "",
          moreLocationStart: data?.moreLocationStart || "",
          city: data?.city || "",
          district: data?.district || "",
          commune: data?.commune || "",
          moreLocation: data?.moreLocation || "",
          description: data?.description,
          suitablePerson: data?.suitablePerson,
          highlight: data?.highlight,
          termsAndCondition: data?.termsAndCondition,
          rate: 0,
          creator: user?.id,
          owner: user.enterpriseId || user.id,
          isDeleted: false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newTour, {
        message: res.locals.t("tour_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(id: number, data: Update, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      if (data.imagesDeleted) {
        await FileService.deleteFiles2(data.imagesDeleted);
      }
      const imageUrls = await FileService.uploadAttachments2([...files]);
      // const imageUrls = images?.map((image) => image?.url);

      const tour = await this.toursModel.findOne({
        where: {
          id: id,
        },
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      const newImageUrls = (data.images || []).concat(imageUrls);

      await this.toursModel.update(
        {
          numberOfDays: data?.numberOfDays,
          numberOfNights: data?.numberOfNights,
          images: newImageUrls,
          contact: data?.contact,
        },
        {
          where: {
            parentLanguage: id,
          },
          transaction: t,
        }
      );

      if (data.language) {
        tour.numberOfDays = data?.numberOfDays;
        tour.numberOfNights = data?.numberOfNights;
        tour.images = newImageUrls;
        tour.contact = data?.contact;
        await tour.save({ transaction: t });

        const tourLang = await this.toursModel.findOne({
          where: {
            parentLanguage: id,
            language: data.language,
          },
        });
        if (!tourLang) {
          const tourNew = await this.toursModel.create(
            {
              title: data?.title,
              numberOfDays: data?.numberOfDays,
              numberOfNights: data?.numberOfNights,
              images: newImageUrls,
              contact: data?.contact,
              cityStart: data?.cityStart || "",
              districtStart: data?.districtStart || "",
              communeStart: data?.communeStart || "",
              moreLocationStart: data?.moreLocationStart || "",
              city: data?.city || "",
              district: data?.district || "",
              commune: data?.commune || "",
              moreLocation: data?.moreLocation || "",
              description: data?.description,
              suitablePerson: data?.suitablePerson,
              highlight: data?.highlight,
              termsAndCondition: data?.termsAndCondition,
              parentLanguage: id,
              language: data.language,
              rate: 0,
              creator: user?.id,
              owner: user.enterpriseId || user.id,
              isDeleted: false,
            },
            { transaction: t }
          );
          await t.commit();
          return res.onSuccess(tourNew, {
            message: res.locals.t("common_update_success"),
          });
        } else {
          tourLang.title = data?.title;
          tourLang.numberOfDays = data?.numberOfDays;
          tourLang.numberOfNights = data?.numberOfNights;
          tourLang.images = newImageUrls;
          tourLang.contact = data?.contact;
          tourLang.cityStart = data?.cityStart;
          tourLang.districtStart = data?.districtStart;
          tourLang.communeStart = data?.communeStart;
          tourLang.moreLocationStart = data?.moreLocationStart || "";
          tourLang.city = data?.city;
          tourLang.district = data?.district;
          tourLang.commune = data?.commune;
          tourLang.moreLocation = data?.moreLocation || "";
          tourLang.description = data?.description;
          tourLang.suitablePerson = data?.suitablePerson;
          tourLang.highlight = data?.highlight;
          tourLang.termsAndCondition = data?.termsAndCondition;
          await tourLang.save({ transaction: t });
          await t.commit();
          return res.onSuccess(tourLang, {
            message: res.locals.t("common_update_success"),
          });
        }
      }
      tour.title = data?.title;
      tour.numberOfDays = data?.numberOfDays;
      tour.numberOfNights = data?.numberOfNights;
      tour.images = newImageUrls;
      tour.contact = data?.contact;
      tour.cityStart = data?.cityStart;
      tour.districtStart = data?.districtStart;
      tour.communeStart = data?.communeStart;
      tour.moreLocationStart = data?.moreLocationStart || "";
      tour.city = data?.city;
      tour.district = data?.district;
      tour.commune = data?.commune;
      tour.moreLocation = data?.moreLocation || "";
      tour.description = data?.description;
      tour.suitablePerson = data?.suitablePerson;
      tour.highlight = data?.highlight;
      tour.termsAndCondition = data?.termsAndCondition;
      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tour, {
        message: res.locals.t("common_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async delete(id: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const whereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };

      const tour = await this.toursModel.findOne({
        where: whereOptions,
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      tour.isDeleted = true;
      await this.toursModel.update(
        {
          isDeleted: true,
        },
        {
          where: {
            parentLanguage: id,
          },
          transaction: t,
        }
      );
      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_delete_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
