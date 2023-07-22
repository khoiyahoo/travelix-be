import CronJob from 'node-cron'
import { USER_TIMEZONE, EPAYMENT_SCHEDULE_STATUS } from 'models/general'
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import TourBillService from "modules/admin/tourBill/tourBill.service";
// import PaymentScheduleService from "modules/main/payment-schedule/payment-schedule.service";


const initScheduleJobs = () => {
    try {
        // const TourBillServiceI = Container.get(TourBillService)
        // const scheduleSendRemindEmail = CronJob.schedule('*/5 * * * * *', () => {
        //     TourBillServiceI.deleteUnpaidBill()
        // },
        //     {
        //         timezone: USER_TIMEZONE.VI
        //     })
        // scheduleSendRemindEmail.start();

    }
    catch (error) {
        console.log(error)
    }
}

export default initScheduleJobs