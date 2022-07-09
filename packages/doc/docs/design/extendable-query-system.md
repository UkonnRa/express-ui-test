# Extendable Query System

## Introduction

In Mikro ORM we have already [an elegant Mongo-like query system](https://mikro-orm.io/docs/query-conditions),
but that's not enough. In a real world system we need a more unify, extendable query system with should work together
with external queries from other systems.

Say to a Journal, instead of the normal SQL queries, we need:

* isReadable to the operator: whether the operator of the query can read the result(s). In fact, not all results we should
  return to the customers.
* Fulltext search: In local mode we always use JS Regex to do the simple search, in remote mode we prefer ElasticSearch.
* AccessItem's Containing User: When searching "Whether the user is in the admin/member/both", SQL cannot handle this
  complex query, we need JS to do that.

The ideal query API should be like:

```js
const query = {
  // All Smart Query should be compatible
  "$or": {
    "name": "Name 1",
    "description": "Description 1"
  },

  "$fulltext": { // Fulltext search on Journal
    "fields": ["name", "description"],
    "value": "Key Word"
  },
  "tags": {
    "$fulltext": "Tag", // Any tag matches the fulltext search with "Tag",
    "$eq": "Some Value", // AND any tag contains "Some Value"
    // To be clear, the first operations may not on the same value
    "$any": { // Use an $any wrapper, the two operations will operate on the same value 
      "$fulltext": "Tag",
      "$eq": "Some Value"
    },
    "$all": { // By default, the array search is $any
      "$like": "Like"
    }
  },
  "members": { // To be clear, `members` contains both user and group
    "$custom:containingUser": "user-id" // `$custom:` prefix is for entity-specific custom filter
  },
  "$readable": "user-id" // Whether this journal is readable to User[user-id]
}
```

Converting to boolean expressions, will be like:

$$
\begin{eqnarray}
(s_1 + s_2) *e_1* \Sigma_i(e_2^i *s_3^i)* \Sigma_i(e_3^i) *\Pi_i(s_4^i)* \Sigma_i(e_4^i) * e_5
\end{eqnarray}
$$

Since:

$$
\begin{eqnarray}
& & (s_1 + e_1)(s_2 + e_2) \\
&=& s_1 s_2 + s_1 e_2 + e_1 s_2 + e_1 e_2
\end{eqnarray}
$$

We cannot group the SQL operators and external operators clearly, there MUST be some mixed expressions.

The operators can be split to 2 groups:

* Logical Operators: `$and`, `$or`, `$not`, `$any`, `$all`
* Comparison Operators: `$eq`, `$ne`, `$in`, ...
  * And all customized operators

For each Comparison Operators, we need to let the entity check whether it's a valid operator on the specific field:

```typescript
function isValid(user: User, operator: Operator, field: string, value: any): boolean
```

## Detail Design

### Common Query

#### Containing User Query

For entities with user list or access items, we can search whether a user is in the entity.

```json
{
  // Global Search: searching on all possible fields containing users
  "$containingUser": "user-id",
  // Field Search: searching on one specific field
  "admins": {
    "$containingUser": "user-id"
  }
}
```

#### Full Text Query

For entities with text-related fields, we can search keywords by an external full-text engine like ElasticSearch.

```json
{
  // Global Search: searching on all possible fields containing users
  "$fullText": "keyword",
  // Field Search: searching on one specific field
  "description": {
    "$fullText": "keyword"
  }
}
```

#### Readable Query

Only entities readable by the operator can be searched.

```json
{
  "$readable": "user-id"
}
```

### User Query

<!-- markdownlint-disable -->
@startuml
interface UserQuery {
  + id: string | string[]
  + name: string | { $fullText: string } // default is full matching, not full text
  + role: UserRoleValue
  + authIds: Record<string, string>
}
@enduml
<!-- markdownlint-restore -->

### Group Query

<!-- markdownlint-disable -->
@startuml
note left of GroupQuery::admins
The array is finding by all, all users should in the admins
end note
interface GroupQuery {
  + $fullText: string
  + $containingUser: string
  + id: string | string[]
  + name: string | { $fullText: string } // default is full matching, not full text
  + description: string // default is full text
  + admins: string | string[]
  + members: string | string[]
}
@enduml
<!-- markdownlint-restore -->

### Journal Query

<!-- markdownlint-disable -->
@startuml
interface JournalQuery {
  + $fullText: string
  + $containingUser: string
  + id: string | string[]
  + name: string | { $fullText: string } // default is full matching, not full text
  + description: string
  + tags: string | string[] | { $fullText: string }
  + unit: string
  + includeArchived: boolean
  + admins: { type: AccessItemTypeValue, id: string }
  + members: { type: AccessItemTypeValue, id: string }
}
@enduml
<!-- markdownlint-restore -->

### Account Query

<!-- markdownlint-disable -->
@startuml
interface AccountQuery {
  + $fullText: string
  + id: string | string[]
  + journal: string
  + name: string | { $fullText: string } // default is full matching, not full text
  + description: string
  + type: AccountTypeValue
  + strategy: AccountStrategyValue
  + unit: string
  + includeArchived: boolean
}
@enduml
<!-- markdownlint-restore -->

### Record Query

<!-- markdownlint-disable -->
@startuml
interface RecordQuery {
  + $fullText: string
  + id: string | string[]
  + journal: string
  + name: string | { $fullText: string } // default is full matching, not full text
  + description: string
  + type: RecordTypeValue
  + timestamp: { from?: Date, to?: Date }
  + tags: string | string[]
}
@enduml
<!-- markdownlint-restore -->
