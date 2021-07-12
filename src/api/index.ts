import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import utils from './routes/utils';

// guaranteed to get dependencies
export default () => {
	const app = Router();
	auth(app);
	user(app);
	utils(app);

	return app
}
