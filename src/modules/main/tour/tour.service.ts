import { Inject, Service } from "typedi";
import { FindAll } from "./tour.models";
import { Response } from "express";
import { Op, Order, WhereOptions } from "sequelize";
import GetLanguage from "services/getLanguage";
import { tourLangFields } from "models/langField";
import { EServiceType } from "common/general";
import { ESortOption } from "models/general";

@Service()
export default class TourService {
  constructor(
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales
  ) {}
  public async findAll(data: FindAll, res: Response) {
    try {
      const lang = res.locals.language;
      let whereOptions: WhereOptions = {
        parentLanguage: null,
        isDeleted: false,
        latestTourDate: {
          [Op.gt]: new Date(),
        },
      };

      if (data?.keyword) {
        whereOptions = {
          ...whereOptions,
          [Op.or]: [
            { title: { [Op.substring]: data.keyword } },
            { city: { [Op.substring]: data.keyword } },
            { district: { [Op.substring]: data.keyword } },
            { commune: { [Op.substring]: data.keyword } },
            { moreLocation: { [Op.substring]: data.keyword } },
          ],
        };
      }

      if (data?.dateSearch) {
        const tourOnSales = await this.tourOnSalesModel.findAll({
          where: {
            startDate: data?.dateSearch,
          },
        });
        const tourIds = tourOnSales.map((item) => item.tourId);
        whereOptions = {
          ...whereOptions,
          id: tourIds,
        };
      }

      let order: Order = null;
      if (!isNaN(data?.sort)) {
        switch (data.sort) {
          case ESortOption.LOWEST_PRICE:
            order = [["minPrice", "ASC"]];
            break;
          case ESortOption.HIGHEST_PRICE:
            order = [["maxPrice", "DESC"]];
            break;
          case ESortOption.HIGHEST_RATE:
            order = [["rate", "DESC"]];
            break;
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
            association: "tourOnSales",
            where: {
              startDate: {
                [Op.gt]: new Date(),
              },
            },
          },
          {
            association: "tourPolicies",
            where: {
              serviceType: EServiceType.TOUR,
            },
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
        order: order,
      });

      const result = GetLanguage.getLangListModel<ModelsAttributes.TourSchedule>(listTours.rows, lang, tourLangFields);

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

  public async findOne(id: number, res: Response) {
    try {
      const lang = res.locals.language;
      const tourWhereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
      };
      let tour = await this.toursModel.findOne({
        where: tourWhereOptions,
        include: [
          {
            association: "languages",
          },
          {
            association: "tourOnSales",
            where: {
              startDate: {
                [Op.gt]: new Date(),
              },
            },
          },
          {
            association: "tourPolicies",
            where: {
              serviceType: EServiceType.TOUR,
            },
          },
        ],
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }

      tour = GetLanguage.getLang(tour.toJSON(), lang, tourLangFields);

      return res.onSuccess(tour);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  // /**
  //  * Get tour of user
  //  */
  // public async getTour(tourId: number, res: Response) {
  //   try {
  //     const tour = await this.toursModel.findOne({
  //       where: {
  //         id: tourId,
  //       },
  //     });
  //     if (!tour) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }
  //     const result = {
  //       ...tour?.dataValues,
  //       businessHours: tour?.businessHours.split(","),
  //       images: tour?.images.split(","),
  //       tags: tour?.tags.split(","),
  //     };
  //     return res.onSuccess(result, {
  //       message: res.locals.t("get_tour_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get tours of user
  //  */
  // public async getTours(userId: number, res: Response) {
  //   try {
  //     const listTours = await this.toursModel.findAll({
  //       where: {
  //         creator: userId,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!listTours) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }
  //     const tours = listTours.map((item) => {
  //       return {
  //         ...item?.dataValues,
  //         businessHours: item?.businessHours.split(","),
  //         images: item?.images.split(","),
  //         tags: item?.tags.split(","),
  //       };
  //     });
  //     return res.onSuccess(tours, {
  //       message: res.locals.t("get_tours_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all tours
  //  */
  // public async getAllTours(res: Response) {
  //   try {
  //     const listTours = await this.toursModel.findAll({
  //       where: {
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!listTours) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }
  //     const tours = listTours.map((item) => {
  //       return {
  //         ...item?.dataValues,
  //         businessHours: item?.businessHours.split(","),
  //         images: item?.images.split(","),
  //         tags: item?.tags.split(","),
  //       };
  //     });
  //     return res.onSuccess(tours, {
  //       message: res.locals.t("get_all_tours_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all tours by page
  //  */
  // public async getAllToursByPage(page: number, res: Response) {
  //   try {
  //     let limit = 9
  //     let offset = 0 + (page - 1) * limit
  //     let stopCondition = limit * page

  //     const listTours = await this.toursModel.findAll({
  //       where: {
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!listTours) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }

  //     const numberOfTours = listTours.length
  //     let tours = []
  //     for(offset; offset < stopCondition; offset++){
  //       if(offset >= numberOfTours) break;
  //       tours.push({
  //         ...listTours[offset]?.dataValues,
  //         businessHours: listTours[offset]?.businessHours.split(","),
  //         images: listTours[offset]?.images.split(","),
  //         tags: listTours[offset]?.tags.split(","),
  //       })
  //     }
  //     return res.onSuccess(tours, {
  //       message: res.locals.t("get_all_tours_by_page_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Find all
  //  */
  // public async findAll(data: FindAll, res: Response) {
  //   try {
  //     let whereOptions: WhereOptions = {
  //       parentLanguage: null,
  //       isTemporarilyStopWorking: false,
  //       isDeleted: false,
  //     }

  //     let offset = (data.take) * (data.page - 1);

  //     const listTours = await this.toursModel.findAndCountAll({
  //       where: whereOptions,
  //       include: [
  //         {
  //           association: 'languages'
  //         }
  //       ],
  //       limit: data.take,
  //       offset: offset,
  //       distinct: true
  //     });

  //     return res.onSuccess(listTours.rows, {
  //       meta: {
  //         take: data.take,
  //         itemCount: listTours.count,
  //         page: data.page,
  //         pageCount: Math.ceil(listTours.count / (data.take))
  //       }
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async createNewTour(data: ITour, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const newTour = await this.toursModel.create(
  //       {
  //         title: data?.title,
  //         description: data?.description || "",
  //         businessHours: data?.businessHours || "",
  //         location: data?.location,
  //         contact: data?.contact,
  //         price: data?.price,
  //         discount: data?.discount || 0,
  //         tags: data?.tags || "",
  //         images: data?.images,
  //         rate: 0,
  //         creator: data?.creator,
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //       {
  //         transaction: t,
  //       }
  //     );
  //     await t.commit();
  //     return res.onSuccess({...newTour, images: newTour.images.split(",")}, {
  //       message: res.locals.t("tour_create_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async updateTour(tourId: number, data: IUpdateTour, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const tour = await this.toursModel.findOne({
  //       where: {
  //         id: tourId,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!tour) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("tour_not_found"),
  //       });
  //     }
  //     if (data.title) tour.title = data.title;
  //     if (data.description) tour.description = data.description;
  //     if (data.businessHours) tour.businessHours = data.businessHours;
  //     if (data.location) tour.location = data.location;
  //     if (data.contact) tour.contact = data.contact;
  //     if (data.price) tour.price = data.price;
  //     if (data.discount) tour.discount = data.discount;
  //     if (data.tags) tour.tags = data.tags;
  //     if (data.images) tour.images = data.images;

  //     await tour.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(tour, {
  //       message: res.locals.t("tour_update_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async temporarilyStopWorking(tourId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const tour = await this.toursModel.findOne({
  //       where: {
  //         id: tourId,
  //       },
  //     });
  //     if (!tour) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("tour_not_found"),
  //       });
  //     }
  //     tour.isTemporarilyStopWorking = true;

  //     await tour.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(tour, {
  //       message: res.locals.t("tour_temporarily_stop_working_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async workAgain(tourId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const tour = await this.toursModel.findOne({
  //       where: {
  //         id: tourId,
  //       },
  //     });
  //     if (!tour) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("tour_not_found"),
  //       });
  //     }
  //     tour.isTemporarilyStopWorking = false;

  //     await tour.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(tour, {
  //       message: res.locals.t("start_working_again_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async deleteTour(tourId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const tour = await this.toursModel.findOne({
  //       where: {
  //         id: tourId,
  //       },
  //     });
  //     if (!tour) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("tour_not_found"),
  //       });
  //     }
  //     tour.isDeleted = true;

  //     await tour.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(tour, {
  //       message: res.locals.t("tour_delete_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Search tours by name
  //  */
  // public async searchTour(name: string, res: Response) {
  //   try {
  //     const listTours = await this.toursModel.findAll({
  //       where: {
  //         title: {
  //           [Op.like]: "%" + name + "%",
  //         },
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //     });
  //     const tours = listTours.map((item) => {
  //       return {
  //         ...item?.dataValues,
  //         images: item?.images.split(","),
  //         tags: item?.tags.split(","),
  //       };
  //     });
  //     return res.onSuccess(tours, {
  //       message: res.locals.t("get_searched_tours_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Search tours by location
  //  */
  // public async searchByLocation(location: string, res: Response) {
  //   try {
  //     const listTours = await this.toursModel.findAll({
  //       where: {
  //         location: {
  //           [Op.like]: "%" + location + "%",
  //         },
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //     });
  //     const hotels = listTours.map((item) => {
  //       return {
  //         ...item?.dataValues,
  //         images: item?.images.split(","),
  //         tags: item?.tags.split(","),
  //       };
  //     });
  //     return res.onSuccess(hotels, {
  //       message: res.locals.t("get_searched_tours_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Enterprise search tours by name
  //  */
  // public async searchTourOfEnterprise(userId: number, name: string, res: Response) {
  //   try {
  //     const listTours = await this.toursModel.findAll({
  //       where: {
  //         title: {
  //           [Op.like]: "%" + name + "%",
  //         },
  //         creator: userId,
  //         isDeleted: false,
  //       },
  //     });
  //     const tours = listTours.map((item) => {
  //       return {
  //         ...item?.dataValues,
  //         images: item?.images.split(","),
  //         tags: item?.tags.split(","),
  //       };
  //     });
  //     return res.onSuccess(tours, {
  //       message: res.locals.t("get_searched_tours_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }
}
