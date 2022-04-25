import { useState, useEffect } from 'react';
import api from '../../Services/api';
import { FaArrowLeft } from 'react-icons/fa';
import { Container, Owner, Loading, BackButton, IssueList, PageActions, FilterActions } from './styles';

export default function Repository({ match }) {

    const [ repository, setRepository ] = useState([]);
    const [ issues, setIssues ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ page, setPage ] = useState(1);
    const [ filters, setFilters ] = useState([
      {state: 'all', label: 'All', active: true},
      {state: 'open', label: 'Open', active: false},
      {state: 'closed', label: 'Close', active: false},
    ]);

    const [ filterIndex, setFilterIndex ] = useState(0);

    useEffect(() => {

      async function load(){
        const nameRepo = decodeURIComponent(match.params.repository);

        const [ repositoryData, issuesData ] = await Promise.all([
          api.get(`/repos/${nameRepo}`),
          api.get(`/repos/${nameRepo}/issues`, {
            params: {
              state: filters.find(f => f.active).state,
              per_page: 5,
            }
          }),
        ]);

        setRepository(repositoryData.data);
        setIssues(issuesData.data);
        setLoading(false);
      }

      load();

    }, [match.params.repository, filters]);

    useEffect(() => {
      async function loadIssue(){
        const nameRepo = decodeURIComponent(match.params.repository);
        const response = await api.get(`/repos/${nameRepo}/issues`, {
          params: {
            state: filters[filterIndex].state,
            page,
            per_page: 5,
          },
        })

        setIssues(response.data);
      }

      loadIssue();
    }, [match.params.repository, page, filters, filterIndex]);

    function handlePage(action){
      setPage(action === 'back' ? page -1 : page + 1);
    }

    function handleFilter(index){
      setFilterIndex(index);
    }

    if(loading){
      return(
        <Loading>
          <h1>Loading...</h1>
        </Loading>
      )
    }

    return (
      <Container>
        <BackButton to="/">
            <FaArrowLeft color='#000' size={30} />
        </BackButton>
        <Owner>
          <img src={repository.owner.avatar_url} alt={`avatar of ${repository.name}`}/>
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <FilterActions active={filterIndex}>
          {filters.map((filter, index) => (
            <button type="button" key={filter.label} onClick={() => handleFilter(index)}>
              {filter.label}
            </button>
          ))}
        </FilterActions>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />

              <div>
                <strong>
                    <a href={issue.html_url}>{issue.title}</a>

                    {issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <PageActions>
          <button type='button' onClick={() => handlePage('back')}>Back</button>
          <button type='button' onClick={() => handlePage('next')}>Next</button>
        </PageActions>
      </Container>
    );
  }
  