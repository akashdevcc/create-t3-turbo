import { useGlobalSearchParams } from "expo-router";

import { Post } from "@acme/native";

import { api } from "~/utils/api";

export default function () {
  const { id } = useGlobalSearchParams();
  if (!id || typeof id !== "string") throw new Error("unreachable");
  const { data } = api.post.byId.useQuery({ id: parseInt(id) });

  if (!data) return null;

  return <Post title={data.title} content={data.content} />;
}
