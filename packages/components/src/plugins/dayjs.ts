import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";

dayjs.extend(localizedFormat);
dayjs.extend(localeData);
dayjs.extend(weekday);
