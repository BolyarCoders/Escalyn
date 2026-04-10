using Escalyn.Api.Data.Models;
using Escalyn.Api.Data.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Escalyn.Api.Data.Repositories
{
    public class CaseRepository : ICaseRepository
    {
        private readonly ApplicationDbContext _context;

        public CaseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Case?> GetByIdAsync(Guid id)
        {
            return await _context.Cases
                .Include(c => c.Questions)
                .ThenInclude(qb => qb.Questions)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Case>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Cases
                .Include(c => c.User)
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Case>> GetByStatusAsync(string status)
        {
            return await _context.Cases
                .Include(c => c.User)
                .Where(c => c.Status == status)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Case>> GetAllAsync()
        {
            return await _context.Cases
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Case> CreateAsync(Case @case)
        {
            @case.CreatedAt = DateTime.UtcNow;
            _context.Cases.Add(@case);
            await _context.SaveChangesAsync();
            return @case;
        }

        public async Task<Case> UpdateAsync(Case @case)
        {
            _context.Cases.Update(@case);
            await _context.SaveChangesAsync();
            return @case;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var @case = await _context.Cases.FindAsync(id);
            if (@case == null)
                return false;

            _context.Cases.Remove(@case);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Cases.AnyAsync(c => c.Id == id);
        }
    }
}
