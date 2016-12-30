create table chat_questions(
question_id int PRIMARY KEY,
question_content text,
chat_mapping_id int
);

create table chat_answers(
answer_id int PRIMARY KEY,
answer_content text,
chat_mapping_id int
);

