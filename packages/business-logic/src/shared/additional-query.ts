export default interface AdditionalQuery {
  type: "Fulltext";
  value: string;
  fields: string[];
}
