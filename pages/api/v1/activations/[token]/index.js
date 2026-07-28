import { createRouter } from "next-connect";
import controller, { onNoMatch, onError } from "infra/controller";
import activation from "models/activation.js";
import { Permissions } from "infra/rule.js";
import authorization from "models/authorization.js";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .patch(controller.canRequest(Permissions.ACTIVATION_TOKEN), patchHandlerToken)
  .handler({ onNoMatch, onError });

async function patchHandlerToken(request, response) {
  const token = request.query?.token;

  const activationTokenMatch = await activation.findActivationByToken(token);
  await activation.activateUserbyUserId(activationTokenMatch.user_id);
  const activationTokenUsed = await activation.markTokenAsUsed(token);
  const userContext = request.context?.user;

  const output = await authorization.filterOutput(
    userContext,
    Permissions.ACTIVATION_TOKEN,
    activationTokenUsed,
  );

  return response.status(200).json(output);
}
