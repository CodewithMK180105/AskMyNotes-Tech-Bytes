import { User, Subject, ChatMessage, MCQ, ShortAnswer } from "./types";

export const dummyUser: User = {
    id: "usr_001",
    name: "Nikunj Raykundlia",
    email: "nikunj@example.com",
    avatar_initials: "NR",
};

export const dummySubjects: Subject[] = [
    {
        id: "sub_001",
        name: "Database Management Systems",
        short_name: "DBMS",
        color: "indigo",
        files: [
            { id: "f_001", name: "dbms_notes_unit1.pdf", size: "2.4 MB", pages: 45, uploaded_at: "2026-02-20" },
            { id: "f_002", name: "normalization_guide.pdf", size: "1.1 MB", pages: 22, uploaded_at: "2026-02-21" },
            { id: "f_003", name: "sql_cheatsheet.txt", size: "45 KB", pages: 3, uploaded_at: "2026-02-22" }
        ],
        created_at: "2026-02-19"
    },
    {
        id: "sub_002",
        name: "Operating Systems",
        short_name: "OS",
        color: "violet",
        files: [
            { id: "f_004", name: "os_processes_threads.pdf", size: "3.2 MB", pages: 58, uploaded_at: "2026-02-20" },
            { id: "f_005", name: "memory_management.pdf", size: "1.8 MB", pages: 34, uploaded_at: "2026-02-22" }
        ],
        created_at: "2026-02-20"
    },
    {
        id: "sub_003",
        name: "Computer Networks",
        short_name: "CN",
        color: "cyan",
        files: [
            { id: "f_006", name: "cn_osi_model.pdf", size: "1.5 MB", pages: 28, uploaded_at: "2026-02-23" }
        ],
        created_at: "2026-02-21"
    }
];

export const dummyChatMessages: ChatMessage[] = [
    {
        id: "msg_001",
        role: "user",
        content: "What is normalization in DBMS? Explain the different normal forms.",
        timestamp: "2026-02-25T10:30:00Z"
    },
    {
        id: "msg_002",
        role: "assistant",
        content: "**Normalization** is the process of organizing data in a database to reduce redundancy and improve data integrity.\n\n### Normal Forms:\n\n1. **First Normal Form (1NF):** A relation is in 1NF if all attributes contain only atomic (indivisible) values and each record is unique.\n\n2. **Second Normal Form (2NF):** A relation is in 2NF if it is in 1NF and every non-key attribute is fully functionally dependent on the entire primary key (no partial dependencies).\n\n3. **Third Normal Form (3NF):** A relation is in 3NF if it is in 2NF and no non-key attribute is transitively dependent on the primary key.\n\n4. **Boyce-Codd Normal Form (BCNF):** A stricter version of 3NF where every determinant must be a candidate key.\n\nNormalization helps eliminate insertion, deletion, and update anomalies.",
        confidence: "High",
        citations: [
            { file: "dbms_notes_unit1.pdf", page: 12, chunk_id: "c_001" },
            { file: "normalization_guide.pdf", page: 3, chunk_id: "c_015" }
        ],
        evidence: [
            "Normalization is the systematic approach of decomposing tables to eliminate data redundancy and undesirable characteristics like Insertion, Update and Deletion anomalies. — dbms_notes_unit1.pdf, Page 12",
            "A relation is in BCNF if and only if every determinant is a candidate key. BCNF is a stronger form of 3NF that handles certain anomalies not addressed by 3NF. — normalization_guide.pdf, Page 3",
            "1NF requires that each column contains atomic values, 2NF removes partial dependencies, and 3NF removes transitive dependencies. — dbms_notes_unit1.pdf, Page 14"
        ],
        timestamp: "2026-02-25T10:30:05Z"
    },
    {
        id: "msg_003",
        role: "user",
        content: "What is the difference between clustered and non-clustered index?",
        timestamp: "2026-02-25T10:32:00Z"
    },
    {
        id: "msg_004",
        role: "assistant",
        content: "### Clustered Index vs Non-Clustered Index\n\n| Feature | Clustered Index | Non-Clustered Index |\n|---------|----------------|--------------------|\n| **Data Order** | Physically reorders table data | Does not change physical order |\n| **Count** | Only 1 per table | Multiple per table |\n| **Speed** | Faster for range queries | Faster for specific lookups |\n| **Storage** | No extra storage needed | Requires additional storage |\n| **Leaf Nodes** | Contain actual data rows | Contain pointers to data rows |\n\nA **clustered index** defines the physical order in which data is stored in the table. A **non-clustered index** creates a separate structure with pointers back to the original data rows.",
        confidence: "High",
        citations: [
            { file: "dbms_notes_unit1.pdf", page: 28, chunk_id: "c_042" }
        ],
        evidence: [
            "A clustered index determines the physical order of data in a table. There can be only one clustered index per table because the data rows themselves can only be sorted in one order. — dbms_notes_unit1.pdf, Page 28"
        ],
        timestamp: "2026-02-25T10:32:04Z"
    },
    {
        id: "msg_005",
        role: "user",
        content: "Explain the CAP theorem.",
        timestamp: "2026-02-25T10:35:00Z"
    },
    {
        id: "msg_006",
        role: "assistant",
        content: null,
        is_not_found: true,
        not_found_message: "Not found in your notes for Database Management Systems",
        timestamp: "2026-02-25T10:35:02Z"
    }
];

export const dummyMCQs: MCQ[] = [
    {
        id: "mcq_001",
        question: "Which normal form eliminates transitive dependencies?",
        options: [
            { label: "A", text: "First Normal Form (1NF)" },
            { label: "B", text: "Second Normal Form (2NF)" },
            { label: "C", text: "Third Normal Form (3NF)" },
            { label: "D", text: "Boyce-Codd Normal Form (BCNF)" }
        ],
        correct: "C",
        explanation: "Third Normal Form (3NF) specifically addresses transitive dependencies. A relation is in 3NF if it is in 2NF and no non-key attribute is transitively dependent on the primary key.",
        citation: { file: "dbms_notes_unit1.pdf", page: 14, chunk_id: "c_008" },
        evidence: "1NF requires that each column contains atomic values, 2NF removes partial dependencies, and 3NF removes transitive dependencies.",
        confidence: "High"
    },
    {
        id: "mcq_002",
        question: "What does ACID stand for in database transactions?",
        options: [
            { label: "A", text: "Atomicity, Consistency, Isolation, Durability" },
            { label: "B", text: "Authentication, Consistency, Integrity, Durability" },
            { label: "C", text: "Atomicity, Completeness, Isolation, Dependency" },
            { label: "D", text: "Atomicity, Consistency, Integrity, Durability" }
        ],
        correct: "A",
        explanation: "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), and Durability (committed data survives failures).",
        citation: { file: "dbms_notes_unit1.pdf", page: 32, chunk_id: "c_050" },
        evidence: "Transaction properties, commonly known as ACID properties, include Atomicity, Consistency, Isolation, and Durability.",
        confidence: "High"
    },
    {
        id: "mcq_003",
        question: "How many clustered indexes can a table have?",
        options: [
            { label: "A", text: "Unlimited" },
            { label: "B", text: "Only 1" },
            { label: "C", text: "Only 2" },
            { label: "D", text: "Depends on the DBMS" }
        ],
        correct: "B",
        explanation: "A table can have only one clustered index because the clustered index defines the physical order of data rows in the table, and data can only be physically sorted in one way.",
        citation: { file: "dbms_notes_unit1.pdf", page: 28, chunk_id: "c_042" },
        evidence: "A clustered index determines the physical order of data in a table. There can be only one clustered index per table.",
        confidence: "High"
    },
    {
        id: "mcq_004",
        question: "Which SQL command is used to remove a table from the database?",
        options: [
            { label: "A", text: "DELETE TABLE" },
            { label: "B", text: "REMOVE TABLE" },
            { label: "C", "text": "DROP TABLE" },
            { label: "D", "text": "TRUNCATE TABLE" }
        ],
        correct: "C",
        explanation: "DROP TABLE removes the entire table structure and its data from the database permanently. DELETE removes rows, and TRUNCATE removes all rows but keeps the structure.",
        citation: { file: "sql_cheatsheet.txt", page: 1, chunk_id: "c_062" },
        evidence: "DROP TABLE <table_name> : Deletes a table and its structure permanently.",
        confidence: "Medium"
    },
    {
        id: "mcq_005",
        question: "Which type of join returns all rows from both tables, with NULLs where there is no match?",
        options: [
            { label: "A", text: "INNER JOIN" },
            { label: "B", text: "LEFT JOIN" },
            { label: "C", "text": "RIGHT JOIN" },
            { label: "D", "text": "FULL OUTER JOIN" }
        ],
        correct: "D",
        explanation: "A FULL OUTER JOIN returns all rows from both tables. Where there is no match, the missing side will have NULL values. INNER JOIN only returns matching rows.",
        citation: { file: "sql_cheatsheet.txt", page: 2, chunk_id: "c_068" },
        evidence: "FULL OUTER JOIN: Returns all records when there is a match in either left or right table.",
        confidence: "Low"
    }
];

export const dummyShortAnswers: ShortAnswer[] = [
    {
        id: "sa_001",
        question: "Explain the difference between DDL and DML commands in SQL with examples.",
        model_answer: "**DDL (Data Definition Language)** commands define and manage database structures. Examples include CREATE TABLE, ALTER TABLE, DROP TABLE, and TRUNCATE TABLE. These commands affect the schema of the database.\n\n**DML (Data Manipulation Language)** commands manipulate data within existing structures. Examples include SELECT, INSERT, UPDATE, and DELETE. These commands affect the data stored in tables.\n\nKey difference: DDL changes the structure, DML changes the data.",
        citation: { file: "sql_cheatsheet.txt", page: 1, chunk_id: "c_060" },
        evidence: "DDL defines the structure, while DML modifies the data.",
        confidence: "High"
    },
    {
        id: "sa_002",
        question: "What are the advantages of normalization in database design?",
        model_answer: "The main advantages of normalization include:\n\n1. **Eliminates data redundancy** — reduces duplicate data storage\n2. **Prevents anomalies** — avoids insertion, update, and deletion anomalies\n3. **Improves data integrity** — ensures consistency across the database\n4. **Saves storage space** — less duplicate data means less storage\n5. **Makes queries more efficient** — smaller, well-structured tables can improve query performance\n6. **Easier maintenance** — changes need to be made in fewer places",
        citation: { file: "normalization_guide.pdf", page: 1, chunk_id: "c_012" },
        evidence: "Normalization prevents anomalies and eliminates data redundancy.",
        confidence: "High"
    },
    {
        id: "sa_003",
        question: "Describe the purpose of the PRIMARY KEY constraint and how it differs from UNIQUE.",
        model_answer: "A **PRIMARY KEY** uniquely identifies each record in a table. It must contain unique values and cannot contain NULL values. A table can have only one primary key, which can consist of one or multiple columns (composite key).\n\nA **UNIQUE** constraint also ensures all values in a column are different, but unlike PRIMARY KEY:\n- A table can have multiple UNIQUE constraints\n- UNIQUE columns can accept one NULL value (in most DBMS)\n- UNIQUE does not automatically create a clustered index\n\nBoth enforce uniqueness, but PRIMARY KEY is the main identifier of the record.",
        citation: { file: "dbms_notes_unit1.pdf", page: 8, chunk_id: "c_005" },
        evidence: "PRIMARY KEY constraint uniquely identifies each record. UNIQUE constraint ensures all values are different.",
        confidence: "Medium"
    }
];
