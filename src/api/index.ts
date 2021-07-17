import { Router } from 'express';
import auth from './routes/auth';
import utils from './routes/utils';

// guaranteed to get dependencies
export default () => {
	const app = Router();
	auth(app);
	utils(app);

	return app
}
