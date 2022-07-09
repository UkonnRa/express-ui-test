import { AbstractEntity } from "@white-rabbit/business-logic";
import { PageInfo } from "@white-rabbit/types";
import Edge from "./edge";

export default interface Connection<E extends AbstractEntity<E>> {
  readonly pageInfo: PageInfo;
  readonly edges: Array<Edge<E>>;
}
