import FullTextQuery from "./full-text.query";
import ContainingUserQuery from "./containing-user.query";
import IsReadableQuery from "./is-readable.query";

type AdditionalQuery = FullTextQuery | ContainingUserQuery | IsReadableQuery;

export default AdditionalQuery;
