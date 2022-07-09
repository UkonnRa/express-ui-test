import FullTextQuery from "./full-text.query";
import ContainingUserQuery from "./containing-user.query";
import ReadableQuery from "./readable.query";

type AdditionalQuery = FullTextQuery | ContainingUserQuery | ReadableQuery;

export default AdditionalQuery;
