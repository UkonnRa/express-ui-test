import FullTextQuery from "./full-text.query";
import IncludeDeletedQuery from "./include-deleted.query";

type AdditionalQuery = FullTextQuery | IncludeDeletedQuery;

export default AdditionalQuery;
