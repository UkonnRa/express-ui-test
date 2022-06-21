import FullTextQuery from "./full-text.query";
import ContainingUserQuery from "./containing-user.query";

type AdditionalQuery = FullTextQuery | ContainingUserQuery;

export default AdditionalQuery;
