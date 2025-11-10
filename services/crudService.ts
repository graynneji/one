import { CrudAdapter, ReadOptions } from "@/adapter/crudAdapter";
import { getErrorMessage } from "@/utils";
import Toast from "react-native-toast-message";

export class CrudService {
  constructor(private crudAdapter: CrudAdapter) {}

  // CRUD
  async create<T>(table: string, payload: Partial<T>) {
    return await this.crudAdapter.create(table, payload);
  }

  async read(
    table: string,
    options?: { orderBy?: string; ascending?: boolean },
    column: string = "*"
  ): Promise<{ result: any[]; error: unknown | null } | undefined> {
    try {
      const { data, error } = await this.crudAdapter.read(
        table,
        options,
        column
      );
      if (error) throw new Error(error.message);
      return { result: data, error };
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Error Occurred",
        text2: getErrorMessage(err),
      });
      return;
    }
  }

  async getUserById<T>(
    table: string,
    filters: Partial<T> = {},
    column: string,
    options?: ReadOptions
  ): Promise<{ result: any[]; count: number } | undefined> {
    try {
      const { data, error, count } = await this.crudAdapter.readById(
        table,
        filters,
        column,
        options
      );
      if (error) throw new Error(error.message);
      return { result: data, count: count ?? 0 };
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Error Occurred",
        text2: getErrorMessage(err),
      });
      return;
    }
  }

  async updateUser<T>(
    table: string,
    payload: Partial<T>,
    column?: string,
    id?: string
  ) {
    try {
      return await this.crudAdapter.update(table, payload, column, id);
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1: "Error Occurred",
        text2: getErrorMessage(err),
      });
      return;
    }
  }

  async deleteUser(id: string) {
    return await this.crudAdapter.delete("users", id);
  }

  // Example: posts
  async createPost(values: {
    title: string;
    content: string;
    user_id: string;
  }) {
    return await this.crudAdapter.create("posts", values);
  }

  async rpcCall<T>(fn: string, params: Partial<T>) {
    return await this.crudAdapter.rpc(fn, params);
  }

  async markMessagesRead(table: string, senderId: string, receiverId: string) {
    return await this.crudAdapter.markMessagesRead(table, senderId, receiverId);
  }
}
