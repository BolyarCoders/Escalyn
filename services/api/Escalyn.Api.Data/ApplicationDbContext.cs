using Escalyn.Api.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Escalyn.Api.GCommon.MainCommons;

namespace Escalyn.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Case> Cases { get; set; }
        public DbSet<QuestionBody> QuestionsBodies { get; set; }
        public DbSet<Question> Questions { get; set; }

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

            modelBuilder.Entity<Case>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(CaseCommons.DescriptionMaxLength);
                entity.Property(e => e.Company).IsRequired().HasMaxLength(NameMaxLength);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(NameMaxLength);
                entity.Property(e => e.Language).IsRequired().HasMaxLength(LanguageMaxLength);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(CaseCommons.StatusMaxLength);
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Cases)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<QuestionBody>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CaseId).IsRequired();
                entity.HasOne(e => e.Case)
                .WithMany(c => c.Questions)
                .HasForeignKey(e => e.CaseId)
                .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.QuestionAsStr).IsRequired();
                entity.Property(e => e.Answer).IsRequired();
                entity.HasOne(e => e.QuestionsBody)
                .WithMany(u => u.Questions)
                .HasForeignKey(e => e.QuestionsBodyId)
                .OnDelete(DeleteBehavior.Cascade);

            });
        }
    }
}
