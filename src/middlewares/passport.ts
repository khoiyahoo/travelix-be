import Passport from 'passport';
import { Container } from 'typedi';
import PassportJWT from 'passport-jwt';
// import { EUserStatus } from 'models/general';

export default () => {
  const usersModel = Container.get<ModelsInstance.Users>('usersModel')
  const opts = {
    jwtFromRequest: PassportJWT.ExtractJwt.fromExtractors([PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(), PassportJWT.ExtractJwt.fromUrlQueryParameter('access_token')]),
    secretOrKey: process.env.SECRET_JWT_TOKEN,
  };
  Passport.use(
    new PassportJWT.Strategy(opts, async (payload, done) => {
      try {
        let user = await usersModel.findOne({
          where: {
            id: payload.id,
            // status: EUserStatus.ACTIVE,
            // verified: true
          },
          attributes: {
            exclude: ['password']
          }
        })
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error)
      }
    })
  );
};