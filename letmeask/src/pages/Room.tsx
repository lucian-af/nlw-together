import { FormEvent, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import logo from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import '../styles/room.scss';

type RoomPrams = {
  id: string;
};

export function Room() {
  const params = useParams<RoomPrams>();
  const roomId = params.id;
  const [newQuestion, setNewQuestion] = useState('');
  const { user } = useAuth();

  function handleSendQuestion(event: FormEvent) {
    event.preventDefault();

    if (newQuestion.trim() === '') {
      toast('Digite sua pergunta primeiro!', {
        icon: '⚠️',
      });
      return;
    }

    if (!user) {
      toast.error('Faça o login antes de enviar a sua pergunta!!!');
      return;
    }

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false,
    };

    toast
      .promise(
        new Promise((resolve, _) => {
          resolve(database.ref(`rooms/${roomId}/questions`).push(question));
        }),
        {
          loading: 'Enviando...',
          success: <b>Pergunta enviada!</b>,
          error: <b>Falha ao enviar.</b>,
        }
      )
      .then(_ => setNewQuestion(''));
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logo} alt="Letmeask" />
          <RoomCode code={roomId} />
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala Nome da Sala</h1>
          <span>4 de perguntas</span>
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea
            placeholder="O que você quer perguntar ?"
            onChange={event => setNewQuestion(event.target.value)}
            value={newQuestion}
          />

          <div className="form-footer">
            {user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>
                Para enviar uma pergunta <button>faça seu login</button>
              </span>
            )}
            <Button type="submit" disabled={!user}>
              Enviar pergunta
            </Button>
          </div>
        </form>
      </main>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
