import { AbstractEntity, PageInfo } from "@white-rabbit/business-logic";
import Edge from "./edge";

export default interface Connection<E extends AbstractEntity<E>> {
  readonly pageInfo: PageInfo;
  readonly edges: Array<Edge<E>>;
}
