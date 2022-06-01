---
sidebar_position: 3
slug: api-design
---

# API Design

## Top Level Design

### Class Diagram

```plantuml
package common {
  interface Entity {
    id: string // ID
    name: string // Sortable, Fulltext
    description: string, Fulltext
    createdAt: Date // Sortable
    updatedAt: Date // Used as optimistic lock
    deletedAt: Date // Used as soft delete
    
    isReadable(authUser?: AuthUser): boolean
    isWritable(authUser?: AuthUser): boolean
  }

  interface ReadService<E extends Entity> {
    getAll(query: QueryInput): Page<E>
    getOne(query: QueryInput): E | null
  }
  
  interface WriteService<E extends Entity, C> {
    handle(command: CommandInput<C>): E | null
    handle(commands: CommandInput<C>[]): (E | null)[]
  }

  interface Service<E extends Entity, C> extends ReadService, WriteService {
  }

  class AuthUser {
    + user: User
    + scopes: string[]
  }

  QueryInput *-- Pagination
  QueryInput *-- AuthUser
  interface QueryInput {
    + authUser: AuthUser
    + query?: Object
    + pagination: Pagination
    + sort: {field: string, order: ASC | DESC}[]
  }
  
  CommandInput *-- AuthUser
  interface CommandInput<C extends Command> {
    + authUser?: AuthUser
    + command: C
  }
  
  interface Pagination {
    + after: string
    + before: string
    + size: number
    + offset: number
  }
}

package users {
  enum Role {
    Owner, Admin, User;
  }
  
  class AuthId {
    + provider: string
    + value: string
  }

  User *-- Role
  User *-- AuthId
  class User extends Entity {
    + role: Role
    + authIds: AuthId[]
  }
  
  interface UserCommand {
    type: "Create" | "Update" | "Delete"
  }
  
  UserService *-- User
  UserService *-- UserCommand
  class UserService << User, UserCommand >> extends Service {
  }
}

package groups {
  AccessItemGroup *-- Group
  Group *-- User
  note left of Group: If deleted, all related AccessItem should be deleted as well
  class Group extends Entity {
    + admins: User[]
    + members: User[]
  }
  
  
  interface GroupCommand {
    type: "Create" | "Update" | "Delete"
  }
  
  GroupService *-- Group
  GroupService *-- GroupCommand
  class GroupService << Group, GroupCommand >> extends Service {
  }
}

package journals {
  class Unit {
    value: string
  }
  note left: With specific validation, eg. text length, etc.

  Journal *-- AccessItem
  Journal *-- Unit
  class Journal extends Entity {
    + tags: string[] // Fulltext
    + archived: boolean
    + startDate: Date // Sortable
    + endDate: Date
    + admins: AccessItem[]
    + members: AccessItem[]
    + units: Unit[] // Computed
    + mainUnit: Unit
  }

  interface AccessItem {
    contains(user: User): boolean
  }
  
  AccessItemUser *-- User
  class AccessItemUser extends AccessItem {
    + user: User
  }
  
  AccessItemGroup *-- Group
  class AccessItemGroup extends AccessItem {
    + group: Group
  }

  interface JournalCommand {
    type: "Create" | "Update" | "Delete"
  }
  
  JournalService *-- Journal
  JournalService *-- JournalCommand
  class JournalService << Journal, JournalCommand >> extends Service {
  }
}



package accounts {
  enum AccountType {
    Income, Expense, Asset, Liability, Equity;
  }

  Account *-- AccountType
  Account *-- Unit
  note right of Account::nameItems
    name = nameItems.join(':')
    So `name` cannot contains `:`
  end note
  note right of Account::unit
    Only units in the related Journal can be selected
  end note
  class Account extends Entity {
    + nameItems: string[]
    + type: AccountType
    + strategy: "Average" | "FIFO"
    + unit: Unit
    + archived: boolean
  }

  interface AccountCommand {
    + type: "Create" | "Update" | "Delete"
  }
  
  AccountService *-- Account
  AccountService *-- AccountCommand
  class AccountService << Account, AccountCommand >> extends Service {
  }
}

package records {
  note left of Record::type
    * null: The normal case, meaning the actual financial record
    * "Check": The daily assertion for balance checking
  end note
  class Record extends Entity {
    + type: "Check" | null // Sortable
    + timestamp: Date // Sortable
    + tags: string[] // Sortable, Fulltext
    + items: RecordItem[]
  }
  
  Record *-- RecordItem
  RecordItem *-- Account
  RecordItem *-- Price
  class RecordItem extends Entity {
    + account: Account
    + amount: number
    + price: Price
  }
  
  Price *-- Unit
  class Price {
    + price: number
    + unit: Unit
  }
  
  interface RecordCommand {
    + type: "Create" | "Update" | "Delete"
  }
  
  RecordService *-- Record
  RecordService *-- RecordCommand
  class RecordService << Record, RecordCommand >> extends Service {
  }
}

package reports {

  package accountHierarchy {
    note left of AccountHierarchyItem::name
      `name` is the longest prefix of the actual accounts
    end note
    class AccountHierarchyItem {
      + name: string
      + amount: number
      + account?: Account
      + children?: AccountHierarchyItem[]
    }
  
    class AccountHierarchyQuery {
      authUser: AuthUser
      journal: Journal
      query: Map<string, object> // Account-related query
      depth: number // The max depth of the hierarchy
    }
  }
  
  package timeSeries {
    class TimeSeriesItem {
      timestamp: Date
      value: number
    }
    
    class TimeSeriesQuery {
      authUser: AuthUser
      journal: Journal
      query: Map<string, object> // Account-related query
    }
  }

  note left of ReportService::getAccountHierarchyReport
    Used for Pie Chart and Sunburst Chart.
    Usecases:
    * For statements page, query = { <symbol, like Income_USD>: <account query, like {type: Income, unit: "USD"}> }
  end note
  note left of ReportService::getTimeSeriesReport
    Used for Bar Chart and Line Chart.
    Usecases:
    * For statement page:
      * For a single unit: query = { <symbol, like Income_USD>: <account query, like {type: Income, unit: "USD"}> }
      * For amount: query = { <symbol, like Income>: <account query, like {type: Income}> }
    * For account page:
      * For balance: query = { <symbol, like Balance>: {id: <account_id>} }
      * Changes no need to query and can be calculated easily based on the above result
  end note
  class ReportService {
    getAccountHierarchyReport(query: AccountHierarchyQuery): Map<string, AccountHierarchyItem>
    getTimeSeriesReport(query: TimeSeriesQuery): Map<string, TimeSeriesItem[]>
  }
}
```

## JSON:API Specification

import jsonapiSpec from '!!raw-loader!./jsonapi.openapi.yaml';

```yaml
{jsonapiSpec}
```
