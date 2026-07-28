import { createRouter } from "next-connect";
import controller, { onNoMatch, onError } from "infra/controller";
import user from "models/user.js";
import activation from "models/activation.js";
import { Permissions } from "infra/rule.js";
import authorization from "models/authorization.js";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest(Permissions.USER_CREATE), postHandlerUsers)
  .handler({ onNoMatch, onError });

async function postHandlerUsers(request, response) {
  const userData = request.body; //JSON.parse(request.body);

  const newUser = await user.create(userData);

  const token = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, token.id);

  const userContext = request.context?.user;

  const output = await authorization.filterOutput(
    userContext,
    Permissions.USER_READ,
    newUser,
  );
  return response.status(201).json(output);
}
