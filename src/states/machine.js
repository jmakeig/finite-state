import login from './login.js';
import doc from './document.js';

import { Machine } from 'xstate';

const machine = Machine({ ...login, ...doc });

export default machine;
