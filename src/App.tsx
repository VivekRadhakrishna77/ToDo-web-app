import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator, useAuthenticator, } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import {
  fetchUserAttributes
} from 'aws-amplify/auth';

import awsExports from './aws-exports';
Amplify.configure(awsExports);


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faSignOut } from '@fortawesome/free-solid-svg-icons';

const client = generateClient<Schema>();
const trash_icon = <FontAwesomeIcon icon={faTrashCan} />;
const signout_icon = <FontAwesomeIcon icon={faSignOut} />;


const UserProfile = () => {
  const [firstName, setFirstName] = useState('');
  const { user } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        let name: string = attributes.given_name || '';
        if (name == '') {
          name = user.signInDetails?.loginId?.split('@')[0] || '';
        }


        setFirstName(name);
        // assuming 'given_name' is the attribute for first name
      } catch (error) {
        console.error('Error fetching user attributes:', error);
      }
    };

    if (user) {
      getUserAttributes();
    }
  }, [user]);

  return <h2>{firstName}'s Tasks</h2>;
};

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
        order: 2,
        isRequired: true
      },
      password: {
        label: "Password *",
        order: 3,
        isRequired: true
      },
      confirm_password: {
        label: "Confirm Password *",
        order: 4,
        isRequired: true
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

      {({ signOut }) => (

        <main>
          <UserProfile />
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
