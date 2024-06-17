import { useEffect, useState } from "react";
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from 'aws-amplify/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faSignOut } from '@fortawesome/free-solid-svg-icons';
import type { Schema } from "../amplify/data/resource";

import awsExports from './aws-exports';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';

Amplify.configure(awsExports);

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
        if (name === '') {
          name = user.signInDetails?.loginId?.split('@')[0] || '';
        }
        setFirstName(name);
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
  const [inputValue, setInputValue] = useState<string>('');
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const fetchData = async () => {
    try {
      const subscription = client.models.Todo.observeQuery().subscribe({
        next: (data) => {
          setTodos([...data.items]);
        },
      });

      // Clean up the subscription when the component unmounts
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  fetchData();
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
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const createTodo = async () => {
    const newTask = inputValue.trim();
    if (newTask !== '') {
      setInputValue('');
      client.models.Todo.create({ content: newTask });
      fetchData();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      createTodo();
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await client.models.Todo.delete({ id });
    } catch (error) {
      console.error('Error deleting todo', error);
    }
  };

  return (
    <Authenticator
      socialProviders={['apple', 'facebook', 'google']}
      variation="modal"
      formFields={signUpFields}
    >
      {({ signOut }) => (
        <main>
          <UserProfile />
          <ul>
            <li className="addTodo">
              <input
                id="addTaskTextbox"
                className="addTaskTextbox"
                placeholder="Add new task..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              {inputValue && <button className="newTodoBtn" onClick={createTodo}>+</button>}
            </li>
            {todos.length > 0 ? (
              todos.map((todo) => (
                <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
                  <span className="listItemText">{todo.content}</span>
                  <span className="trash_icon">{trash_icon}</span>
                </li>
              ))
            ) : (
              <p>No tasks</p>
            )}
          </ul>
          <button id="signOutButton" onClick={signOut}>
            Sign out <span id="signoutIcon">{signout_icon}</span>
          </button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
