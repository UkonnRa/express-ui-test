# Cursor-Based Pagination (And More)

Pagination is a difficult topic. In most cases, the page-based pagination with offset and limit is enough. But what about
cursor-based? And one more step, can we merge the two together?

## What is Cursor-Based Pagination?

[JSON:API](https://jsonapi.org/profiles/ethanresnick/cursor-pagination/) and
[GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm) is a great starter for understanding
Cursor-Based Pagination.

Briefly speaking, when using Cursor-Based Pagination on a entity list, you need:

* a cursor pointing to an existing entity
* a sorting strategy
* the direction to fetch data from the cursor

## Simple Cursor: ID

To point at an entity, the easiest way is ID. Say an API:

```typescript
function findAll(query: Query, sort: Sort, cursor: IDString, direction: "forward" | "backward", size: number): Page<Entity>
```

Beside the provided `query`, `sort`, `cursor` and `direction` can be thought as **additional queries** too.
If direction is `forward`, after being sorted by `[{ field: "field1", order: ASC }, { field: "field2", order: DESC }]`,
comparing with the anchor pointed by cursor, the result should:

* `result.field1` should be greater than `anchor.field1`
* `result.field2` should be less than `anchor.field2`
* What's more, to prevent the entities with the exactly same values in the sorted fields, we need an additional filter
  like `result.ID > anchor.ID`. In another word, **we can consider ID is always in Sort and the order is always ascending**.

### Backward Query

But if the direction is `backward`, we need to **reverse** all the sort-related filters. In another word, we should change
the backward query to the forward query. In that case,

* `result.field1` should be **less** than `anchor.field1`
* `result.field2` should be **greater** than `anchor.field2`
* `result.ID` should be less than `anchor.ID`

After receiving the result, don't forget to reverse the whole result list to get the right order.

### Conclusion

In conclusion, the steps with Cursor-Based Pagination should be:

* Compute the additional filter items based on `sort`, `cursor` and `direction`
* Get the result based on `size`
* If is a backward query, reverse the result
* About `hasPrevious` and `hasNext`, we need to fetch `size + 1` items to check whether there are more data to fetch

## Reconsider Page-Based Pagination

In fact, the page-based pagination is a special case of the cursor-based pagination:

* The cursor is always empty, which means the query is always from the top of the database
* The direction is always forward
* It has an offset

So our pagination strategy can support it by an additional field: `offset`:

```typescript
function findAll(query: Query, sort: Sort, cursor: IDString, direction: "forward" | "backward", size: number, offset: number): Page<Entity>
```

In the cursor-based context, the field `offset` can be explained as: when fetching the result, skip the first N entities.

## Fat Cursor: Combine with `Query` and `Sort`

Say if you get a cursor somehow, but you don't have the context of the previous query. In the above solution, you cannot
get the result expected by the original query (the query where the cursor is generated).

If you want the cursor still workable even without the previous context (`Query` and `Sort`), you should bind them into
the cursor as well. So instead of a bare ID, the cursor becomes `{id: <Entity ID>, query: <Query>, sort: <Sort>}`.
And the API will become:

```typescript
function findAll(cursor: Cursor, direction: "forward" | "backward", size: number, offset: number, query?: Query, sort?: Sort): Page<Entity>
```

Here `query` and `sort` is optional and should be null **unless the cursor is not provided**.

This use case is a little weird, but may be helpful in specific cases.
