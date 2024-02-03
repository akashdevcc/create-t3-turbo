import * as post from "./schema/post";

export const schema = { ...post };

export { mySqlTable as tableCreator } from "./schema/_table";
