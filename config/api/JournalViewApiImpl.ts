import { v4 } from "uuid";
import { Base64 } from "js-base64";
import dayjs from "dayjs";
import {
  JournalValue,
  PageResult,
  TYPE_GROUP,
  TYPE_USER,
} from "@white-rabbit/type-bridge";

const getType = (i: number) => (i % 2 === 0 ? TYPE_USER : TYPE_GROUP);

const journals: Array<JournalValue> = [
  {
    id: v4(),
    name: "Journal Name 1",
    description: "Journal Description 1",
    admins: Array.from({ length: 10 }, (_, i) => ({
      type: getType(i),
      id: v4(),
    })),
    members: Array.from({ length: 10 }, (_, i) => ({
      type: getType(i),
      id: v4(),
    })),
    startDate: dayjs("2020-01-01").toDate(),
    endDate: dayjs("2020-02-01").toDate(),
    archived: false,
  },
  {
    id: v4(),
    name: "Journal Name 2 with long long long long long long long long long long long long long long long long long long long long name",
    description: "Journal Description 2",
    admins: Array.from({ length: 10 }, (_, i) => ({
      type: getType(i),
      id: v4(),
    })),
    members: Array.from({ length: 10 }, (_, i) => ({
      type: getType(i),
      id: v4(),
    })),
    startDate: dayjs("2020-02-01").toDate(),
    endDate: dayjs("2020-03-01").toDate(),
    archived: true,
  },
  {
    id: v4(),
    name: "Journal Name 3",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tortor massa, pellentesque nec libero non, suscipit commodo dui. Maecenas eget erat aliquam, interdum urna ac, iaculis ligula. Suspendisse blandit velit non posuere tincidunt. In hac habitasse platea dictumst. Nullam sollicitudin imperdiet pulvinar. Integer ultricies lorem fringilla quam convallis, ac ornare sapien auctor. Praesent pretium nibh a tincidunt sollicitudin. Ut purus eros, bibendum in posuere vulputate, posuere nec nunc. Aenean non sollicitudin lorem. Aenean posuere enim ut accumsan egestas. Nunc dictum orci sit amet faucibus venenatis. Praesent vitae massa in ipsum lacinia pellentesque.

Nam et ante quis diam pharetra molestie. Nunc porta dui ac quam bibendum, quis dignissim neque maximus. Donec non pharetra mi. Ut auctor finibus justo, id vulputate sapien eleifend vehicula. Nulla et dui quis orci ultrices maximus. Sed lobortis mi sed pellentesque tincidunt. Etiam iaculis ipsum sit amet molestie mollis.

Quisque laoreet, felis eu luctus sagittis, mi nulla consectetur mi, vel fringilla magna libero quis odio. Vestibulum eget urna enim. Donec tincidunt accumsan hendrerit. Suspendisse iaculis, elit et semper accumsan, libero lectus egestas neque, non pretium nisi sapien non nisi. Morbi egestas pulvinar neque, a auctor augue blandit vitae. Curabitur convallis sem non felis sodales, et gravida ipsum sodales. Duis aliquam volutpat metus, in malesuada justo tincidunt non. Etiam mattis lacus orci, quis convallis ante volutpat vitae. Donec id magna a magna maximus lacinia sed vitae odio. In iaculis, felis eget porttitor blandit, justo enim vehicula ante, quis rhoncus diam turpis hendrerit velit. Quisque posuere pretium velit, ut volutpat tellus facilisis at. Quisque a magna eget mauris euismod posuere. Praesent cursus vel nibh vel vehicula. Nunc imperdiet turpis nisl, ac dictum felis rutrum ut. Fusce laoreet tellus a purus varius, non fringilla sapien volutpat. Mauris convallis, turpis vitae rutrum congue, ipsum sem dapibus lacus, nec consectetur diam diam ut tortor.`,
    admins: Array.from({ length: 10 }, (_, i) => ({
      type: getType(i),
      id: v4(),
    })),
    members: Array.from({ length: 10 }, (_, i) => ({
      type: getType(i),
      id: v4(),
    })),
    startDate: dayjs("2020-03-01").toDate(),
    endDate: dayjs("2020-04-01").toDate(),
    archived: false,
  },
];

export default class JournalViewApiImpl {
  async findAll(): Promise<PageResult<JournalValue>> {
    await new Promise((r) => setTimeout(r, 2000));
    return {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      pageItems: journals.map((item) => ({
        cursor: Base64.encode(item.id, true),
        data: item,
      })),
    };
  }
}
