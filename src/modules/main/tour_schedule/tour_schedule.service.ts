import { Inject, Service } from "typedi";
import { Response } from "express";
import { sequelize } from "database/models";
import { LANG } from "common/general";
import GetLanguage from "services/getLanguage";
import { tourScheduleLangFields } from "models/langField";
import { Transaction, WhereOptions } from "sequelize/types";

@Service()
export default class TourScheduleService {
  constructor(@Inject("tourSchedulesModel") private tourSchedulesModel: ModelsInstance.TourSchedules) {}
  public async findAll(tourId: number, res: Response) {
    const lang = res.locals.language
    try {
      const scheduleWhereOptions: WhereOptions = {
        tourId: tourId,
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

      schedules = GetLanguage.getLangListModel<ModelsAttributes.TourSchedule>(schedules, lang, tourScheduleLangFields);

      return res.onSuccess(schedules);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
