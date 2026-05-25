import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import hbs from 'hbs';
import hbsUtils from 'hbs-utils';
import { join } from 'path';
import session from 'express-session';

async function bootstrap() {
  /*const app = await NestFactory.create(AppModule);*/
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  const layoutsPath = join(__dirname, '..', 'views/layouts');
  hbs.registerPartials(layoutsPath);
  hbsUtils(hbs).registerWatchedPartials(layoutsPath);
  app.setViewEngine('hbs')
  
  /*configuration for session*/
  app.use(session({
    secret: 'nest-book',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(function (req, res, next) {
    res.locals.session = req.session
    const errors: string[] = req.session.flashErrors;
    if (errors) {
      res.locals.flashErrors = errors;
      req.session.flashErrors = null;
    }
    next();
  })


  /* urls accessible by admin user */
  app.use(/^\/admin(\/.*)?$/, function (req, res, next) {
    if (req.session.user && req.session.user.role == 'admin') {
      next();
    } else {
      res.redirect('/')
    }
  })

  /*urls accessible by authenticated users*/
  app.use(/^\/account(\/.*)?$/, function(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/')
    }
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
