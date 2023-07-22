import { Inject, Service } from "typedi";
import { Create, EStayStatusFilter, FindAll, FindOne, Update } from "./stay.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";
import { sequelize } from "database/models";
import FileService from "services/file";
import GetLanguage from "services/getLanguage";
import { stayLangFields } from "models/langField";

@Service()
export default class StayService {
  constructor(
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    // @Inject("staySchedulesModel") private staySchedulesModel: ModelsInstance.TourSchedules
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

      if(data?.type) {
        whereOptions = {
          ...whereOptions,
          type: data.type,
        }
      }

      if(data.status === EStayStatusFilter.ACTIVED) {
        whereOptions = {
          ...whereOptions,
          isDeleted: false,
        }
      }
      if(data.status === EStayStatusFilter.IN_ACTIVED) {
        whereOptions = {
          ...whereOptions,
          isDeleted: true,
        }
      }

      const offset = data.take * (data.page - 1);

      const listStays = await this.staysModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
          // {
          //   attributes: ["id", "startDate", "childrenPrice", "adultPrice"],
          //   association: "tourOnSales",
          // },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listStays.rows, {
        meta: {
          take: data.take,
          itemCount: listStays.count,
          page: data.page,
          pageCount: Math.ceil(listStays.count / data.take),
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

      const stayWhereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };
      let stay = await this.staysModel.findOne({
        where: stayWhereOptions,
        include: [
          {
            association: "languages",
          },
          // {
          //   association: "tourOnSales",
          // },
        ],
      });
      if (!stay) {
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }

      if (data.language) {
        stay = GetLanguage.getLang(stay.toJSON(), data.language, stayLangFields);
      }

      return res.onSuccess(stay);
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

      const newStay = await this.staysModel.create(
        {
          name: data?.name,
          type: data?.type,
          images: imageUrls,
          contact: data?.contact,
          city: data?.city || "",
          district: data?.district || "",
          commune: data?.commune || "",
          moreLocation: data?.moreLocation || "",
          checkInTime: data?.checkInTime,
          checkOutTime: data?.checkOutTime,
          description: data?.description,
          convenient: data?.convenient,
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
      return res.onSuccess(newStay, {
        message: res.locals.t("stay_create_success"),
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

      const stay = await this.staysModel.findOne({
        where: {
          id: id,
        },
      });
      if (!stay) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }
      const newImageUrls = (data.images || []).concat(imageUrls);

      await this.staysModel.update(
        {
          type: data?.type,
          checkInTime: data?.checkInTime,
          checkOutTime: data?.checkOutTime,
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
        stay.type = data?.type;
        stay.checkInTime = data?.checkInTime;
        stay.checkOutTime = data?.checkOutTime;
        stay.images = newImageUrls;
        stay.contact = data?.contact;
        await stay.save({ transaction: t });

        const stayLang = await this.staysModel.findOne({
          where: {
            parentLanguage: id,
            language: data.language,
          },
        });
        if (!stayLang) {
          const stayNew = await this.staysModel.create(
            {
              name: data?.name,
              type: data?.type,
              checkInTime: data?.checkInTime,
              checkOutTime: data?.checkOutTime,
              images: newImageUrls,
              contact: data?.contact,
              city: data?.city || "",
              district: data?.district || "",
              commune: data?.commune || "",
              moreLocation: data?.moreLocation || "",
              description: data?.description,
              convenient: data?.convenient,
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
          return res.onSuccess(stayNew, {
            message: res.locals.t("common_update_success"),
          });
        } else {
          stayLang.name = data?.name;
          stayLang.type = data?.type;
          stayLang.city = data?.city;
          stayLang.district = data?.district;
          stayLang.commune = data?.commune;
          stayLang.moreLocation = data?.moreLocation || "";
          stayLang.description = data?.description;
          stayLang.convenient = data?.convenient;
          stayLang.highlight = data?.highlight;
          stayLang.termsAndCondition = data?.termsAndCondition;
          await stayLang.save({ transaction: t });
          await t.commit();
          return res.onSuccess(stayLang, {
            message: res.locals.t("common_update_success"),
          });
        }
      }
      stay.name = data?.name;
      stay.type = data?.type;
      stay.checkInTime = data?.checkInTime;
      stay.checkOutTime = data?.checkOutTime;
      stay.images = newImageUrls;
      stay.contact = data?.contact;
      stay.city = data?.city;
      stay.district = data?.district;
      stay.commune = data?.commune;
      stay.moreLocation = data?.moreLocation || "";
      stay.description = data?.description;
      stay.convenient = data?.convenient;
      stay.highlight = data?.highlight;
      stay.termsAndCondition = data?.termsAndCondition;
      await stay.save({ transaction: t });
      await t.commit();
      return res.onSuccess(stay, {
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

      const stay = await this.staysModel.findOne({
        where: whereOptions,
      });
      if (!stay) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }
      stay.isDeleted = true;
      await this.staysModel.update(
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
      await stay.save({ transaction: t });
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
