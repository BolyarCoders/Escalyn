using Escalyn.Api.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Escalyn.Api.GCommon.MainCommons;
using static Escalyn.Api.GCommon.Specifics.UserSpecificCommons;

namespace Escalyn.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //User config
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(NameMaxLength);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(NameMaxLength);
                entity.Property(e => e.MiddleName).IsRequired().HasMaxLength(NameMaxLength);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(NameMaxLength);
                entity.Property(e => e.Language).IsRequired().HasMaxLength(LanguageMaxLength);
                entity.Property(e => e.NhostUserId);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
            });

            // RefreshToken - TODO za react compatibility
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.Property(e => e.Token).IsRequired();

                entity.HasOne(e => e.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
