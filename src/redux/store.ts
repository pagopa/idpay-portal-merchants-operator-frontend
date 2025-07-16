// import { configureStore } from '@reduxjs/toolkit';
// import logger from 'redux-logger';
// import { appStateReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
// import { userReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
// import { LOG_REDUX_ACTIONS } from "../utils/constants";
// // import { partiesReducer } from './slices/partiesSlice';
// // import { permissionsReducer } from './slices/permissionsSlice';

// const additionalMiddlewares = [LOG_REDUX_ACTIONS ? logger : undefined];

// export const createStore = () =>
//   configureStore({
//     reducer: {
//       user: userReducer,
//       appState: appStateReducer,
//     //   parties: partiesReducer,
//     //   permissions: permissionsReducer,
//     },
//     middleware: (getDefaultMiddleware: (arg0: { serializableCheck: boolean }) => MiddlewareArray) =>
//       additionalMiddlewares.reduce(
//         (array, middleware) => (middleware ? array.concat(middleware) : array),
//         getDefaultMiddleware({ serializableCheck: false })
//       ),
//   });

// export const store = createStore();

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch;
