// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import Header from './components/Header';
import GameList from './components/GameList';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [previewGames, setPreviewGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGames = (searchQuery) => {
    if (!searchQuery.trim()) {
      setPreviewGames([]);
      return;
    }

    setLoading(true);
    axios
      .get(`https://api.rawg.io/api/games?key=935f87aa7bea4c27ba2ec9c54b03f2bc&page=${page}&page_size=5&search=${searchQuery}`)
      .then((response) => {
        const newGames = response.data.results;
        setPreviewGames(newGames);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar jogos:', error);
        setLoading(false);
      });
  };

  const addGameToCatalog = (game) => {
    if (!games.some((g) => g.id === game.id)) {
      setGames((prevGames) => [
        ...prevGames,
        {
          ...game,
          rating: 0,
          customDescription: '',
          isSavedToBackend: false,
          backendId: null,
        },
      ]);
      setPreviewGames([]);
      setSearchQuery('');
    }
  };

  const deleteGame = (gameId) => {
    const gameToDelete = games.find(game => game.id === gameId);
    if (gameToDelete && gameToDelete.backendId) {
      axios
        .delete(`http://localhost:8080/Game/deletar/${gameToDelete.backendId}`)
        .then(() => {
          setGames(games.filter((game) => game.id !== gameId));
        })
        .catch((error) => {
          console.error('Erro ao deletar jogo:', error);
        });
    } else {
      console.error('Jogo não encontrado ou sem backendId');
    }
  };

  const handleSave = (gameId, newDescription, newRating) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    const transformedRating = newRating;

    if (!game.isSavedToBackend) {
      axios
        .post('http://localhost:8080/Game/criar', {
          rawgId: game.id,
          name: game.name,
          description: newDescription,
          rating: transformedRating,
          image: game.background_image || 'https://via.placeholder.com/300x200',
        })
        .then((response) => {
          setGames(games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  isSavedToBackend: true,
                  customDescription: newDescription,
                  rating: transformedRating,
                  backendId: response.data.id,
                }
              : g
          ));
        })
        .catch((error) => {
          console.error('Erro ao criar o jogo:', error);
        });
    } else {
      axios.put(`http://localhost:8080/Game/atualizar/${game.backendId}`, {
        rawgId: game.id,
        name: game.name,
        description: newDescription,
        rating: transformedRating,
        image: game.background_image || 'https://via.placeholder.com/300x200',
      })
      .then(() => {
        setGames(games.map((g) =>
          g.id === gameId
            ? { ...g, customDescription: newDescription, rating: transformedRating }
            : g
        ));
      })
      .catch((error) => {
        console.error('Erro ao atualizar o jogo:', error);
      });
    }
  };

  const debouncedFetchGames = debounce((query) => fetchGames(query), 500);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    debouncedFetchGames(query);
  };

  const goToNextPage = () => setPage((prevPage) => prevPage + 1);
  const goToPreviousPage = () => setPage((prevPage) => Math.max(prevPage - 1, 1));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGames(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, page]);

  return (
    <div>
      <Header onSearch={handleSearchChange} />

      {searchQuery.trim() !== '' && previewGames.length > 0 && (
        <div className="preview-container w-100 px-3 px-sm-4 py-3">
          <div className="row">
            {previewGames.map((game) => (
              <div
                className="col-12 col-md-4 mb-4"
                key={game.id}
                onClick={() => addGameToCatalog(game)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card preview-card h-100">
                  <img
                    src={game.background_image || 'https://via.placeholder.com/300x200'}
                    className="card-img-top"
                    alt={game.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{game.name}</h5>
                    <p className="card-text" style={{ fontSize: '0.9rem' }}>
                      Clique para adicionar ao catálogo.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn custom-btn"
              onClick={goToPreviousPage}
              disabled={page === 1}
            >
              Anterior
            </button>
            <button
              className="btn custom-btn"
              onClick={goToNextPage}
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      <main>
        <div className="container mt-4">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            </div>
          ) : (
            <div className="row">
              {games.map((game) => (
                <div className="col-md-4" key={game.id}>
                  <GameList
                    gameId={game.id}
                    image={game.background_image}
                    name={game.name}
                    description={game.description}
                    customDescription={game.customDescription}
                    rating={game.rating}
                    backendId={game.backendId}
                    onDelete={deleteGame}
                    onSave={handleSave}
                    onDescriptionChange={(gameId, newDescription) => {
                      const updatedGames = games.map((g) =>
                        g.id === gameId ? { ...g, customDescription: newDescription } : g
                      );
                      setGames(updatedGames);
                    }}
                    onRate={(gameId, newRating) => {
                      const updatedGames = games.map((g) =>
                        g.id === gameId ? { ...g, rating: newRating } : g
                      );
                      setGames(updatedGames);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
