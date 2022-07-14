import { Order, Sort } from "@white-rabbit/types";
import { Order as OrderProto, Sort as SortProto } from "../proto/shared";

export const sortFromProto = (sort: SortProto[]): Sort[] => {
  return sort.map(({ field, order }) => ({
    field,
    order: order === OrderProto.ASC ? Order.ASC : Order.DESC,
  }));
};
