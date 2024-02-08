import _ from "lodash";

export function handleError(ctx, ex) {
  if (_.isEmpty(ctx)) return;
  if (ex.response.status === 401) {
    ex.response ? ctx.unauthorized(ex.response) : ctx.unauthorized(ex);
  } else {
    ex.response
      ? ctx.internalServerError(ex.response)
      : ctx.internalServerError(ex);
  }
}
