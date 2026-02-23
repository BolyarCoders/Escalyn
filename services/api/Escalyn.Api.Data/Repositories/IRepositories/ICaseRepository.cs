using Escalyn.Api.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Repositories.IRepositories
{
    public interface ICaseRepository
    {
        Task<Case?> GetByIdAsync(Guid id);
        Task<IEnumerable<Case>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Case>> GetByStatusAsync(string status);
        Task<IEnumerable<Case>> GetAllAsync();
        Task<Case> CreateAsync(Case @case);
        Task<Case> UpdateAsync(Case @case);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
    }
}
