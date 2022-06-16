# Use Cases

WhiteRabbit is not a professional/serious accounting system, it prefers to handle the daily general journal in a family
and give you a clear report of the financial situation.
Double-entry accounting is a good way to record the financial flow, so WhiteRabbit uses it as the primary strategy.

## Requirements

Here is the feature requirements and system requirements.

### Create

Users can create entities.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Write) then (yes)
  :throw NoPermissionError;
  end
elseif (authUser has already been deleted) then (yes)
  :throw NotFoundError;
  end
endif
group create
:Call findOne with the unique filter;
if (entity with any unique key exists) then (yes)
  :throw AlreadyExistsError;
  end
endif
end group
end group

group business-logic
if (conflict with business logic checking) then (yes)
  :throw related errors;
  end
else
  :Create the entity;
endif
end group

stop
@enduml
<!-- markdownlint-restore -->

### Update

Users can update entities.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Write) then (yes)
  :throw NoPermissionError;
  end
elseif (authUser has already been deleted) then (yes)
  :throw NotFoundError;
  end
endif
group update
if (authUser is higher than ADMIN) then (yes)
  :Call findOne with ID, including deleted;
else
  :Call findOne with ID;
endif
if (entity not exists) then (yes)
  :throw NotFoundError;
  end
endif
end group
end group

group business-logic
if (conflict with business logic checking) then (yes)
  :throw related errors;
  end
else
  :Update the entity;
endif
end group

stop
@enduml
<!-- markdownlint-restore -->

### Delete

Users can delete entities.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Write) then (yes)
  :throw NoPermissionError;
  end
elseif (authUser has already been deleted) then (yes)
  :throw NotFoundError;
  end
endif
group update
if (authUser is higher than ADMIN) then (yes)
  :Call findOne with ID, including deleted;
else
  :Call findOne with ID;
endif
if (entity not exists) then (yes)
  :throw NotFoundError;
  end
endif
end group
end group

group business-logic
if (entity is deleted) then (yes)
  :throw AlreadyDeleted;
  end
else
  :Update deletedAt to now;
  :Update unique keys with a random suffix;
endif
end group

stop
@enduml
<!-- markdownlint-restore -->

### Find All

Users can find all entities based on filters.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Read) then (yes)
:throw NoPermissionError;
end
elseif (authUser has already been deleted) then (yes)
:throw NotFoundError;
end
elseif (authUser is not higher than ADMIN && query includes $additional query) then (yes)
:throw NoPermissionError;
end
endif
end group

group business-logic
:Extract additional query and external query;
note right
* additional query: queries from query.$additional, mostly the admin-specific queries
* external query: queries cannot merge with SQL, mostly:
  * isReadable: business-logic specific queries
  * full text: full text searching using external engines like ElasticSearch
end note
:Create SQL query;
repeat :Get a batch result based on SQL query;
  backward :Get the next batch;
  :Filter the batch result based on external queries;
  :Put the filtered batch into result;
repeat while (The result size is larger than the expected size) is (False) not (True)
:Return Page based on the result;

stop
@enduml
<!-- markdownlint-restore -->

### Find One

Users can find one entity based on filters.

<!-- markdownlint-disable -->
@startuml
start

:Call findPage function, with size = 1;
if (Result size == 0) then (yes)
  :return null;
else
  :return result[0];
endif

stop
@enduml
<!-- markdownlint-restore -->
