import { createRouter } from "next-connect";
import controller, { onNoMatch, onError } from "infra/controller";
import { ForbiddenError } from "infra/errors.js";
import user from "models/user.js";
import { Permissions } from "infra/rule.js";
import authorization from "models/authorization.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest(Permissions.USER_READ), getHandlerUsers);
router.patch(controller.canRequest(Permissions.USER_UPDATE), patchHandlerUsers);

export default router.handler({
  onNoMatch,
  onError,
});

async function getHandlerUsers(request, response) {
  const username = request.query?.username;
  const userItem = await user.findByUsername(username);

  const userContext = request.context?.user;
  const output = await authorization.filterOutput(
    userContext,
    Permissions.USER_READ,
    userItem,
  );

  return response.status(200).json(output);
}

async function patchHandlerUsers(request, response) {
  const username = request.query?.username;
  const userInputValue = request.body;

  const userContext = request.context?.user;
  const userTarget = await user.findByUsername(username);

  if (
    !(await authorization.can(userContext, Permissions.USER_UPDATE, userTarget))
  ) {
    throw new ForbiddenError({
      action: `Verifique se o seu usuário possui a feature [${Permissions.USER_UPDATE}]`,
      message: "O usuário não possui permissão para executar esta ação.",
    });
  }

  const userUpdated = await user.update(username, userInputValue);

  const output = await authorization.filterOutput(
    userContext,
    Permissions.USER_READ,
    userUpdated,
  );

  return response.status(200).json(output);
}
