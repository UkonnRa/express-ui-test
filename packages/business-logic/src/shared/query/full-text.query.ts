export default interface FullTextQuery {
  type: "FullTextQuery";
  value: string;
  fields: string[];
}

export const FULL_TEXT_OPERATOR = "$fullText";
