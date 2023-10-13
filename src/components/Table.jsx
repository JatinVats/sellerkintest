

import "./Table.css"
function Table({ data }) {
  const { suggestedKeywords, searchVolumeData, powerData } = data;

  return (
    <div>
      
      <table className="rounded">
        <thead>
          <tr>
            <th>Keyword</th>
            <th>No. of Listings</th>
            <th>Power Of Keyword</th>
          </tr>
        </thead>
        <tbody>
          {suggestedKeywords.map((keyword) => (
            <tr key={keyword}>
              <td>{keyword}</td>
              <td>{searchVolumeData[keyword]}</td>
              <td>{powerData[keyword]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
  
  export default Table;