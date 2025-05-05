import React, { useState, useEffect } from 'react';

function GameList({
  image,
  name,
  description,
  gameId,
  onDelete,
  customDescription,
  onDescriptionChange,
  onSave,
  isSaved,
  onRate,
  rating,
}) {
  const [newDescription, setNewDescription] = useState(customDescription || ""); 
  const [newRating, setNewRating] = useState(rating); 
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false); 
  const [isRatingChanged, setIsRatingChanged] = useState(false);

  useEffect(() => {
    setNewDescription(customDescription); 
    setNewRating(rating); 
  }, [customDescription, rating]);

  const handleImage = (image) => {
    return image && image.startsWith('http') ? image : 'https://via.placeholder.com/150';  
  };

  const handleSave = () => {
    onDescriptionChange(gameId, newDescription); 
    onRate(gameId, newRating); 
    onSave(gameId, newDescription, newRating); 
  };

  return (
    <div className="card h-100">
      <img 
        src={handleImage(image)} 
        className="card-img-top" 
        alt={name} 
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{name}</h5>

        <textarea
          className="form-control mb-2"
          value={newDescription}
          placeholder="Digite uma descrição personalizada"
          onChange={(e) => {
            setNewDescription(e.target.value); 
            setIsDescriptionChanged(true); 
          }}  
        />
        
        {/* Sistema de estrelinhas para avaliação */}
        <div className="star-rating mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                cursor: "pointer",
                color: star * 2 <= newRating ? "#ffc107" : "#e4e5e9", 
                fontSize: "2rem",
                transition: "color 0.2s ease",
              }}
              onClick={() => {
                setNewRating(star * 2); // Agora o rating é multiplicado por 2
                setIsRatingChanged(true); 
              }}
            >
              ★
            </span>
          ))}
        </div>
        
        <button 
          className="btn btn-primary mb-2"
          onClick={handleSave}
          disabled={!(isDescriptionChanged || isRatingChanged)} 
        >
          Salvar  
        </button>

        <button className="btn btn-danger mt-auto" onClick={() => onDelete(gameId)}>
          Deletar
        </button>
      </div>
    </div>
  );
}

export default GameList;
