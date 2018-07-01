export default {
  key: 'Login',
  initial: 'Anonymous',
  states: {
    Anonymous: {
      on: {
        login: 'ProcessingLogin',
      },
    },
    ProcessingLogin: {
      on: {
        cancel: 'Anonymous',
        error: 'LoginError',
        success: 'Authenticated',
      },
    },
    LoginError: {},
    Authenticated: {},
  },
};
