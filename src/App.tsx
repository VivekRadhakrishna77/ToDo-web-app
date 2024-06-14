import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faSignOut } from '@fortawesome/free-solid-svg-icons';

const client = generateClient<Schema>();
const trash_icon = <FontAwesomeIcon icon={faTrashCan} />;
const signout_icon = <FontAwesomeIcon icon={faSignOut} />;


function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const signUpFields = {
    
    signUp: {
      given_name: {
        type: 'given_name',
        label: 'First Name *',
        placeholder: 'Enter your first name',
        isRequired: true,
        order: 1,
        
      },
      email: {
        label: "Email *",
        order:2,
        isRequired:true
      },
      password: {
        label: "Password *",
        order: 3,
        isRequired:true
      },
      confirm_password: {
        label: "Confirm Password *",
        order: 4,
        isRequired:true
      },
    },
  }
  
  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }
  return (
        
    <Authenticator 
    socialProviders={['apple', 'facebook', 'google']} variation="modal" formFields={signUpFields}
    >

      {({ signOut, user }) => (
        
    <main>
      <h2> {user?.signInDetails?.loginId?.split('@')[0]}'s Tasks</h2>
      <button className="newTodo" onClick={createTodo}>+ Add Task</button>
      <ul>
        {todos.map((todo) => (
          <li 
          onClick={() => deleteTodo(todo.id)}
           key={todo.id}>
            <span className="listItemText">{todo.content}</span>
            
            <span className="trash_icon">{trash_icon} </span>
           </li>
        ))}
      </ul>
      <div>
        <br />

      </div>
      <button id="signOutButton" onClick={signOut}>Sign out <span id="signoutIcon">{signout_icon} </span></button>
    </main>
        
      )}
      </Authenticator>

  );
}

export default App;
