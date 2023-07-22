import { Inject, Service } from "typedi";
import { CreateMultiple, CreateOne, CreateOrUpdate, FindAll, ISchedule, Update } from "./tour_schedule.models";
import { Response } from "express";
import { sequelize } from "database/models";
import { LANG } from "common/general";
import GetLanguage from "services/getLanguage";
import { tourScheduleLangFields } from "models/langField";
import { Transaction, WhereOptions } from "sequelize/types";

@Service()
export default class TourScheduleService {
  constructor(@Inject("tourSchedulesModel") private tourSchedulesModel: ModelsInstance.TourSchedules) {}
  public async findAll(data: FindAll, res: Response) {
    try {
      const scheduleWhereOptions: WhereOptions = {
        tourId: data.tourId,
        language: null,
      };
      let schedules = await this.tourSchedulesModel.findAll({
        where: scheduleWhereOptions,
        include: [
          {
            association: "languages",
          },
        ],
        order: [["startTime", "ASC"]],
      });

      if (data?.language) {
        schedules = GetLanguage.getLangListModel<ModelsAttributes.TourSchedule>(schedules, data.language, tourScheduleLangFields);
      }

      return res.onSuccess(schedules);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createOne(data: CreateOne, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourSchedule = await this.tourSchedulesModel.create(
        {
          tourId: data?.tourId,
          day: data?.day,
          startTime: data?.startTime,
          endTime: data?.endTime,
          description: data?.description,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(tourSchedule, {
        message: res.locals.t("tour_schedule_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createMultiple(data: CreateMultiple, res: Response) {
    const t = await sequelize.transaction();
    try {
      await Promise.all(
        data?.schedule?.map(async (item) => {
          await this.tourSchedulesModel.create(
            {
              tourId: data?.tourId,
              day: data?.day,
              startTime: item?.startTime,
              endTime: item?.endTime,
              description: item?.description,
            },
            {
              transaction: t,
            }
          );
        })
      );
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("tour_schedule_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  private async create(data: CreateOne, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourSchedule = await this.tourSchedulesModel.create(
        {
          tourId: data?.tourId,
          day: data?.day,
          startTime: data?.startTime,
          endTime: data?.endTime,
          description: data?.description,
        },
        {
          transaction: t,
        }
      );
      if (data?.language) {
        await this.tourSchedulesModel.create(
          {
            tourId: data?.tourId,
            day: data?.day,
            description: data?.description,
            language: data.language,
            parentLanguage: tourSchedule.id,
          },
          {
            transaction: t,
          }
        );
      }

      await t.commit();
      return;
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  private async update(t: Transaction, data: Update, res: Response) {
    try {
      const tourSchedule = await this.tourSchedulesModel.findOne({
        where: {
          id: data.id,
        },
      });
      tourSchedule.startTime = data?.startTime;
      tourSchedule.endTime = data?.endTime;
      if (data?.language) {
        const tourScheduleLang = await this.tourSchedulesModel.findOne({
          where: {
            parentLanguage: data.id,
            language: data.language,
          },
        });
        if (tourScheduleLang) {
          tourScheduleLang.description = data.description;
          await tourScheduleLang.save({ transaction: t });
        } else {
          await this.tourSchedulesModel.create(
            {
              tourId: data?.tourId,
              day: data?.day,
              description: data?.description,
              parentLanguage: data.id,
              language: data.language,
            },
            {
              transaction: t,
            }
          );
        }
      } else {
        tourSchedule.description = data?.description;
      }
      await tourSchedule.save({ transaction: t });
      return;
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createOrUpdate(data: CreateOrUpdate, res: Response) {
    const t = await sequelize.transaction();
    try {
      const dataCreate: ISchedule[] = [];
      const dataUpdate: ISchedule[] = [];
      await Promise.all(
        data.schedule.map(async (item) => {
          if (item?.id) {
            return await this.update(t, { ...item, tourId: data?.tourId, day: data?.day, language: data?.language }, res);
          } else {
            return await this.create({ ...item, tourId: data?.tourId, day: data?.day, language: data?.language }, res);
          }
        })
      );
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async delete(id: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const schedule = await this.tourSchedulesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!schedule) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      const schedulesLang = await this.tourSchedulesModel.findAll({
        where: {
          parentLanguage: id,
        },
      });
      const ids = [id];
      schedulesLang.forEach((item) => ids.push(item.id));
      await this.tourSchedulesModel.destroy({
        where: {
          id: ids,
        },
      });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_delete_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async deleteMultiple(tourId: number, day: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const schedule = await this.tourSchedulesModel.findAll({
        where: {
          tourId: tourId,
          day: day,
        },
      });
      if (!schedule.length) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      const ids = schedule.map((item) => item.id);
      await this.tourSchedulesModel.destroy({
        where: {
          id: ids,
        },
      });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_delete_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
