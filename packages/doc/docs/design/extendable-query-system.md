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
