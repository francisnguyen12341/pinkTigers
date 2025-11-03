#!/bin/bash

# Create account
curl -X POST -H "Content-Type:application/json" -d "{\"username\": \"testUser\", \"password\": \"testPass\"}" http://localhost:3000/create-account # empty response

# Create folders
# root
curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder1\", \"user_id\": 1}" http://localhost:3000/folder # empty response
# non-root
curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder2\", \"user_id\": 1, \"parent_id\": 1}" http://localhost:3000/folder # empty response
curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder3\", \"user_id\": 1, \"parent_id\": 1}" http://localhost:3000/folder # empty response

# Get folders
curl http://localhost:3000/folder?name="testFolder1" # {"folder":[{"id":1,"name":"testFolder1","user_id":1,"parent_id":null}]}
curl http://localhost:3000/folder?name="testFolder2" # {"folder":[{"id":2,"name":"testFolder2","user_id":1,"parent_id":1}]}
curl http://localhost:3000/folder?name="testFolder3" # {"folder":[{"id":3,"name":"testFolder3","user_id":1,"parent_id":1}]}
curl http://localhost:3000/folder?name="testFolder4" # {"folder":[]}
curl http://localhost:3000/folder # { error: "Missing name." }

# Delete folders
curl -X DELETE http://localhost:3000/folder?name="testFolder1" # {"message":"testFolder1 has been deleted successfully."}
curl -X DELETE http://localhost:3000/folder?name="testFolder2" # { error: "Folder not found." } (because of cascade delete)
curl -X DELETE http://localhost:3000/folder # { error: "Missing name." }
