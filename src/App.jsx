import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'

function App() {
  const [value, setValue] = useState()
  const [pokemon, setPokemon] = useState()
  const [pokemonList, setPokemonList] = useState([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selected, setSelected] = useState(null)
  const [description, setDescription] = useState('')
  const limit = 20
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`


  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
      )

      const newItems = await Promise.all(
        response.data.results.map(async (p) => {
          const splitUrl = p.url.split('/')
          const id = splitUrl[splitUrl.length - 2]

          const pokemonResponse = await axios.get(p.url)

          return {
            name: p.name,
            id: id,
            types: pokemonResponse.data.types.map(t => t.type.name)
          }
        })
      )

      setPokemonList((prev) => [...prev, ...newItems])
      setOffset((prev) => prev + limit)
      setHasMore(response.data.next !== null)

    } catch (error) {
      console.log(error)
    }

    setLoading(false)

  }, [offset, loading, hasMore])

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    function handleScroll() {
      const scrollBottom = window.innerHeight + window.scrollY
      const threshold = document.documentElement.scrollHeight - 300
      if (scrollBottom >= threshold) {
        loadMore()
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)

  }, [loadMore])


  function openDetails(id) {
    setDescription('')
    axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then((response) => {
      const pokemonData = response.data
      setSelected(pokemonData)

      axios.get(pokemonData.species.url).then((speciesResponse) => {
        const entry = speciesResponse.data.flavor_text_entries.find(
          (e) => e.language.name === 'en'
        )
        setDescription(
          entry
            ? entry.flavor_text.replace(/[\n\f]/g, ' ')
            : 'No description available.'
        )
      })
    })
  }

  function closeDetails() {
    setSelected(null)
  }
  function handleButton() {
    axios.get(url).then((response) => {
      setValue(response.data)
    })
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleButton()
    }
  }

  function handleInputChange(event) {
    setPokemon(event.target.value)

  }

  function getTypeColor(type) {
    const colors = {
      normal: '#A8A77A',
      fire: '#EE8130',
      water: '#6390F0',
      electric: '#F7D02C',
      grass: '#7AC74C',
      ice: '#96D9D6',
      fighting: '#C22E28',
      poison: '#A33EA1',
      ground: '#E2BF65',
      flying: '#A98FF3',
      psychic: '#F95587',
      bug: '#A6B91A',
      rock: '#B6A136',
      ghost: '#735797',
      dragon: '#6F35FC',
      dark: '#705746',
      steel: '#B7B7CE',
      fairy: '#D685AD'
    }

    return colors[type] || '#888'
  }
  return (
    <div>
      <div className='searchBar'>
        <input type=" text" value={pokemon} placeholder="Pokemon" onChange={handleInputChange} onKeyDown={handleKeyDown} />
        <button onClick={handleButton}>
          fetch pokemon
        </button>
      </div>
      <p className='guide'>Click on a card to see more details</p>
      <div className='searchedCard'>
        {value && (
  <div className="pokemonWrapper">

    <div className="card" onClick={() => openDetails(value.id)}>

      <div className="imageContainer">
        <span className="pokemonId">#{value.id}</span>

        <img
          className="picture"
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${value.id}.png`}
        />
      </div>

      <div className="withCard">
        <p>{value.name}</p>

        <div className="detailTypes">
          {value.types.map((t) => (
            <span
              key={t.type.name}
              className={`type-${t.type.name}`}
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

    </div>

  </div>
)}
      </div>
      <div className='cardList'>
        {pokemonList.map((p) => (
          <div className="pokemonWrapper" key={p.id}>

            <div className="card" onClick={() => openDetails(p.id)}>

              <div className="imageContainer">
                <span className="pokemonId">#{p.id}</span>

                <img
                  className="picture"
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                />
              </div>

              <div className="withCard">
                <p>{p.name}</p>

                <div className="pokemonTypes">
                  {p.types.map((type) => (
                    <span key={type} className={`type-${type}`}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>

            </div>



          </div>
        ))}
      </div>
      {loading && <p className='loadingText'>Loading more...</p>}

      {selected && (
        <div className='modalOverlay' onClick={closeDetails} >
          <div
            className='modal'
            onClick={(e) => e.stopPropagation()}
            style={{
              '--type-color': getTypeColor(selected.types[0].type.name)
            }}
          >
            <button className='closeButton' onClick={closeDetails}>×</button>
            <img
              className='modalPicture'
              style={{
                borderColor: getTypeColor(selected.types[0].type.name)
              }}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selected.id}.png`}
            />            <h2
              style={{
                color: getTypeColor(selected.types[0].type.name)
              }}
            >
              {selected.name}
            </h2>
            <div className="description">
              <span className="descriptionTitle">Description: </span>
              <p>{description || 'Loading description...'}</p>
            </div>

            <div className="infoList">
              <div className="infoBox">
                <span>ID</span>
                <strong>#{selected.id}</strong>
              </div>

              <div className="infoBox">
                <span>Height</span>
                <strong>{selected.height}</strong>
              </div>

              <div className="infoBox">
                <span>Weight</span>
                <strong>{selected.weight}</strong>
              </div>
            </div>
            <div className="detailSection">
              <span className="sectionTitle">Types</span>

              <div className="detailTypes">
                {selected.types.map((t) => (
                  <span
                    key={t.type.name}
                    className={`type-${t.type.name}`}
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="detailSection">
              <span className="sectionTitle">Abilities</span>

              <div className="abilities">
                {selected.abilities.map((a) => (
                  <span key={a.ability.name}>
                    {a.ability.name}
                  </span>
                ))}
              </div>
            </div>
            <div className='statsList'>
  {selected.stats.map((s) => (
    <div key={s.stat.name} className='statRow'>

      <div className='statTop'>
        <span>{s.stat.name}</span>
        <span>{s.base_stat}</span>
      </div>

      <div className='statBar'>
        <div
          className={`statFill stat-${s.stat.name}`}
          style={{
            width: `${Math.min(s.base_stat, 100)}%`
          }}
        ></div>
      </div>

    </div>
  ))}
</div>
          </div>
        </div>
      )}
    </div>
  )

}
export default App