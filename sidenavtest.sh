curl -X POST -H "Content-Type:application/json" -d "{\"username\": \"testUser\", \"password\": \"testPass\"}" http://localhost:3000/create-account

# root folder (which was created when testUser was created) has id of 1
curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder1\", \"parent_id\": 1}" http://localhost:3000/folder



curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder2\", \"parent_id\": 2}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder3\", \"parent_id\": 3}" http://localhost:3000/folder



curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder4\", \"parent_id\": 1}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder5\", \"parent_id\": 5}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder6\", \"parent_id\": 5}" http://localhost:3000/folder



curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder7\", \"parent_id\": 1}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder8\", \"parent_id\": 8}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder9\", \"parent_id\": 9}" http://localhost:3000/folder



curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder10\", \"parent_id\": 1}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder11\", \"parent_id\": 11}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder12\", \"parent_id\": 11}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder13\", \"parent_id\": 11}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder14\", \"parent_id\": 14}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder15\", \"parent_id\": 15}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder16\", \"parent_id\": 15}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder17\", \"parent_id\": 15}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder18\", \"parent_id\": 18}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder19\", \"parent_id\": 11}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder20\", \"parent_id\": 20}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder21\", \"parent_id\": 20}" http://localhost:3000/folder

curl -X POST -H "Content-Type:application/json" -d "{\"name\": \"testFolder22\", \"parent_id\": 20}" http://localhost:3000/folder
