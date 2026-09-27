import {
  assert,
  canMatchHost,
  canMatchPermissions,
  canMatchRoute,
  selectProps,
} from "../../common";
import {
  MicrofrontendManifest,
  MicrofrontendPermission,
  MicrofrontendRouteOptions,
} from "../Microfrontend/Microfrontend.types";

type MicrofrontendMatchingRoute = {
  entry: string;
  scope: string;
  module: string;
  route: string;
  host?: string;
};

/**
 *
 * @param manifests
 * @param url
 * @param options
 * @param options.transformPermission Use this to replace keywords in permissions such as :companyAccountId or :userId
 * @returns slots matching the current location url
 */
export const getMicrofrontendsMatchingLocation = (
  manifests: MicrofrontendManifest[],
  url: string,
  options: {
    host?: string;
    user?: { permissions: MicrofrontendPermission[] };
    transformPermission?: (
      permission: MicrofrontendPermission
    ) => MicrofrontendPermission;
  }
): MicrofrontendMatchingRoute[] =>
  manifests
    ?.reduce(
      (arr, manifest) =>
        [
          ...arr,
          ...(manifest.slots.routes?.map((route) => ({
            ...selectProps(["entry", "scope", "module", "auth"])(manifest),
            ...(typeof route === "string" ? { route } : route),
          })) || []),
        ] as MicrofrontendMatchingRoute[],
      [] as MicrofrontendMatchingRoute[]
    )
    .filter(
      ({ route, host: routeHost }: MicrofrontendRouteOptions) =>
        canMatchRoute(route, url) && canMatchHost(routeHost, options?.host)
    )
    .filter(
      ({ auth }: MicrofrontendRouteOptions) =>
        !auth?.required ||
        canMatchPermissions(
          assert(options?.user, "options.user must exist"),
          auth?.permissions?.map(
            typeof options?.transformPermission === "function"
              ? options?.transformPermission
              : (p) => p
          ) || []
        )
    );
