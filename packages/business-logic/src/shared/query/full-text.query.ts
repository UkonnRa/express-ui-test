export default interface FullTextQuery {
  type: "FullTextQuery";
  value: string;
  fields: string[];
}
